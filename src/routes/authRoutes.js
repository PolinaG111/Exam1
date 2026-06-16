const express = require("express");
const { body, validationResult } = require("express-validator");
const authService = require("../services/AuthService");

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
  res.render("auth/login", {
    pageTitle: "Вход",
    errors: [],
    formData: { login: "" },
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

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/login", {
        pageTitle: "Вход",
        errors: errors.array(),
        formData: { login: req.body.login || "" },
      });
    }

    try {
      const user = await authService.authenticateUser(req.body.login, req.body.password);
      req.session.admin = null;
      req.session.user = user;
      req.flash("success", "Вы успешно вошли в личный кабинет.");
      return res.redirect("/dashboard");
    } catch (error) {
      return res.status(401).render("auth/login", {
        pageTitle: "Вход",
        errors: [{ msg: error.message }],
        formData: { login: req.body.login || "" },
      });
    }
  }
);

router.get("/register", (req, res) => {
  res.render("auth/register", {
    pageTitle: "Регистрация",
    errors: [],
    formData: {
      login: "",
      fullName: "",
      birthDate: "",
      phone: "",
      email: "",
    },
  });
});

router.post("/register", registrationValidation, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/register", {
      pageTitle: "Регистрация",
      errors: errors.array(),
      formData: {
        login: req.body.login || "",
        fullName: req.body.fullName || "",
        birthDate: req.body.birthDate || "",
        phone: req.body.phone || "",
        email: req.body.email || "",
      },
    });
  }

  try {
    const user = await authService.registerUser(req.body);
    req.session.user = user;
    req.session.admin = null;
    req.flash("success", "Регистрация завершена. Добро пожаловать в систему.");
    return res.redirect("/dashboard");
  } catch (error) {
    return res.status(409).render("auth/register", {
      pageTitle: "Регистрация",
      errors: [{ msg: error.message }],
      formData: {
        login: req.body.login || "",
        fullName: req.body.fullName || "",
        birthDate: req.body.birthDate || "",
        phone: req.body.phone || "",
        email: req.body.email || "",
      },
    });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
