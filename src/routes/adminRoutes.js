const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  ADMIN_CREDENTIALS,
  APPLICATION_STATUSES,
  TRANSPORT_TYPES,
} = require("../config/constants");
const { requireAdmin } = require("../middleware/authMiddleware");
const applicationRepository = require("../repositories/ApplicationRepository");
const { buildFormState } = require("../utils/formUtils");
const { formatRuDate } = require("../utils/dateUtils");

const router = express.Router();
const PAGE_SIZE = 6;

router.get("/admin/login", (req, res) => {
  const formState = buildFormState([], { login: "" });

  res.render("admin/login", {
    pageTitle: "Вход администратора",
    generalErrors: [],
    formState,
  });
});

router.post(
  "/admin/login",
  [
    body("login").trim().notEmpty().withMessage("Введите логин администратора."),
    body("password").notEmpty().withMessage("Введите пароль администратора."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    const formState = buildFormState(errors.array(), { login: req.body.login || "" });

    if (!errors.isEmpty()) {
      return res.status(422).render("admin/login", {
        pageTitle: "Вход администратора",
        generalErrors: formState.generalErrors,
        formState,
      });
    }

    if (
      req.body.login !== ADMIN_CREDENTIALS.login ||
      req.body.password !== ADMIN_CREDENTIALS.password
    ) {
      const failedState = buildFormState(
        [{ path: "password", msg: "Неверный логин или пароль администратора." }],
        { login: req.body.login || "" }
      );

      return res.status(401).render("admin/login", {
        pageTitle: "Вход администратора",
        generalErrors: failedState.generalErrors,
        formState: failedState,
      });
    }

    req.session.user = null;
    req.session.admin = { login: ADMIN_CREDENTIALS.login };
    req.flash("success", "Вход администратора выполнен.");
    return res.redirect("/admin/dashboard");
  }
);

router.get("/admin/dashboard", requireAdmin, (req, res) => {
  const filters = {
    status: req.query.status || "",
    transportType: req.query.transportType || "",
    search: (req.query.search || "").trim(),
    sortBy: req.query.sortBy || "createdAt",
    sortDir: req.query.sortDir === "asc" ? "asc" : "desc",
    page: Math.max(1, Number(req.query.page) || 1),
    pageSize: PAGE_SIZE,
  };
  const result = applicationRepository.findAdminPage(filters);
  const applications = result.items.map((item) => ({
    ...item,
    startDateFormatted: formatRuDate(item.startDate),
    createdAtFormatted: formatRuDate(item.createdAt.slice(0, 10)),
  }));
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  res.render("admin/dashboard", {
    pageTitle: "Панель администратора",
    applications,
    statuses: APPLICATION_STATUSES,
    transportTypes: TRANSPORT_TYPES,
    filters,
    pagination: {
      currentPage: filters.page,
      totalPages,
      totalItems: result.total,
      hasPrev: filters.page > 1,
      hasNext: filters.page < totalPages,
    },
  });
});

router.post(
  "/admin/applications/:id/status",
  requireAdmin,
  [body("status").isIn(APPLICATION_STATUSES).withMessage("Выбран недопустимый статус.")],
  (req, res) => {
    const errors = validationResult(req);
    const returnTo = req.body.returnTo || req.get("referer") || "/admin/dashboard";

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect(returnTo);
    }

    applicationRepository.updateStatus(Number(req.params.id), req.body.status);
    req.flash("success", "Статус заявки обновлен.");
    return res.redirect(returnTo);
  }
);

router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

module.exports = router;
