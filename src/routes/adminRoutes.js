const express = require("express");
const { body, validationResult } = require("express-validator");
const { ADMIN_CREDENTIALS, APPLICATION_STATUSES } = require("../config/constants");
const { requireAdmin } = require("../middleware/authMiddleware");
const applicationRepository = require("../repositories/ApplicationRepository");

const router = express.Router();

router.get("/admin/login", (req, res) => {
  res.render("admin/login", {
    pageTitle: "Вход администратора",
    errors: [],
    formData: { login: "" },
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

    if (!errors.isEmpty()) {
      return res.status(422).render("admin/login", {
        pageTitle: "Вход администратора",
        errors: errors.array(),
        formData: { login: req.body.login || "" },
      });
    }

    if (
      req.body.login !== ADMIN_CREDENTIALS.login ||
      req.body.password !== ADMIN_CREDENTIALS.password
    ) {
      return res.status(401).render("admin/login", {
        pageTitle: "Вход администратора",
        errors: [{ msg: "Неверный логин или пароль администратора." }],
        formData: { login: req.body.login || "" },
      });
    }

    req.session.user = null;
    req.session.admin = { login: ADMIN_CREDENTIALS.login };
    req.flash("success", "Вход администратора выполнен.");
    return res.redirect("/admin/dashboard");
  }
);

router.get("/admin/dashboard", requireAdmin, (req, res) => {
  const applications = applicationRepository.findAllWithUsers();

  res.render("admin/dashboard", {
    pageTitle: "Панель администратора",
    applications,
    statuses: APPLICATION_STATUSES,
  });
});

router.post(
  "/admin/applications/:id/status",
  requireAdmin,
  [body("status").isIn(APPLICATION_STATUSES).withMessage("Выбран недопустимый статус.")],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect("/admin/dashboard");
    }

    applicationRepository.updateStatus(Number(req.params.id), req.body.status);
    req.flash("success", "Статус заявки обновлен.");
    return res.redirect("/admin/dashboard");
  }
);

router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

module.exports = router;
