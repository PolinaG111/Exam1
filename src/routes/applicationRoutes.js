const express = require("express");
const { body, validationResult } = require("express-validator");
const applicationRepository = require("../repositories/ApplicationRepository");
const { requireUser } = require("../middleware/authMiddleware");
const { PAYMENT_METHODS, TRANSPORT_TYPES } = require("../config/constants");
const { parseRuDate } = require("../utils/dateUtils");
const { buildFormState } = require("../utils/formUtils");

const router = express.Router();

router.get("/applications/new", requireUser, (req, res) => {
  const formState = buildFormState([], {
    transportType: "",
    startDate: "",
    paymentMethod: "",
  });

  res.render("applications/new", {
    pageTitle: "Оформление заявки",
    generalErrors: [],
    formState,
    transportTypes: TRANSPORT_TYPES,
    paymentMethods: PAYMENT_METHODS,
  });
});

router.post(
  "/applications",
  requireUser,
  [
    body("transportType")
      .isIn(TRANSPORT_TYPES)
      .withMessage("Выберите доступный вид транспорта."),
    body("startDate")
      .custom((value) => Boolean(parseRuDate(value)))
      .withMessage("Укажите дату в формате ДД.ММ.ГГГГ."),
    body("paymentMethod")
      .isIn(PAYMENT_METHODS)
      .withMessage("Выберите доступный способ оплаты."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    const formState = buildFormState(errors.array(), {
      transportType: req.body.transportType || "",
      startDate: req.body.startDate || "",
      paymentMethod: req.body.paymentMethod || "",
    });

    if (!errors.isEmpty()) {
      return res.status(422).render("applications/new", {
        pageTitle: "Оформление заявки",
        generalErrors: formState.generalErrors,
        formState,
        transportTypes: TRANSPORT_TYPES,
        paymentMethods: PAYMENT_METHODS,
      });
    }

    applicationRepository.create({
      userId: req.session.user.id,
      transportType: req.body.transportType,
      startDate: parseRuDate(req.body.startDate),
      paymentMethod: req.body.paymentMethod,
    });

    req.flash("success", "Заявка отправлена администратору на согласование.");
    return res.redirect("/dashboard");
  }
);

module.exports = router;
