const express = require("express");
const { body, validationResult } = require("express-validator");
const authService = require("../services/AuthService");
const { buildFormState } = require("../utils/formUtils");

const router = express.Router();

const registrationValidation = [
  body("login")
    .trim()
    .matches(/^[A-Za-z0-9]{6,}$/)
    .withMessage("Логин должен содержать не менее 6 латинских букв и цифр."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Пароль должен содержать не менее 8 символов."),
  body("fullName")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Укажите ФИО полностью."),
  body("birthDate").isISO8601().withMessage("Укажите корректную дату рождения."),
  body("phone")
    .trim()
    .matches(/^[+\d\s()-]{10,20}$/)
    .withMessage("Укажите корректный контактный номер телефона."),
  body("email").trim().isEmail().withMessage("Укажите корректный e-mail."),
];

router.get("/login", (req, res) => {
  const formState = buildFormState([], { login: "" });

  res.render("auth/login", {
    pageTitle: "Вход",
    generalErrors: [],
    formState,
  });
});

router.post(
  "/login",
  [
    body("login").trim().notEmpty().withMessage("Введите логин."),
    body("password").notEmpty().withMessage("Введите пароль."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const formState = buildFormState(errors.array(), {
      login: req.body.login || "",
    });

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/login", {
        pageTitle: "Вход",
        generalErrors: formState.generalErrors,
        formState,
      });
    }

    try {
      const user = await authService.authenticateUser(req.body.login, req.body.password);
      req.session.admin = null;
      req.session.user = user;
      req.flash("success", "Вы успешно вошли в личный кабинет.");
      return res.redirect("/dashboard");
    } catch (error) {
      const failedState = buildFormState(
        [{ path: "password", msg: error.message }],
        { login: req.body.login || "" }
      );

      return res.status(401).render("auth/login", {
        pageTitle: "Вход",
        generalErrors: failedState.generalErrors,
        formState: failedState,
      });
    }
  }
);

router.get("/register", (req, res) => {
  const formState = buildFormState([], {
    login: "",
    fullName: "",
    birthDate: "",
    phone: "",
    email: "",
  });

  res.render("auth/register", {
    pageTitle: "Регистрация",
    generalErrors: [],
    formState,
  });
});

router.post("/register", registrationValidation, async (req, res) => {
  const errors = validationResult(req);
  const fields = {
    login: req.body.login || "",
    fullName: req.body.fullName || "",
    birthDate: req.body.birthDate || "",
    phone: req.body.phone || "",
    email: req.body.email || "",
  };
  const formState = buildFormState(errors.array(), fields);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/register", {
      pageTitle: "Регистрация",
      generalErrors: formState.generalErrors,
      formState,
    });
  }

  try {
    const user = await authService.registerUser(req.body);
    req.session.user = user;
    req.session.admin = null;
    req.flash("success", "Регистрация завершена. Добро пожаловать в систему.");
    return res.redirect("/dashboard");
  } catch (error) {
    const failedState = buildFormState([{ path: "login", msg: error.message }], fields);

    return res.status(409).render("auth/register", {
      pageTitle: "Регистрация",
      generalErrors: failedState.generalErrors,
      formState: failedState,
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
