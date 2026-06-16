const express = require("express");
const { body, validationResult } = require("express-validator");
const { requireUser } = require("../middleware/authMiddleware");
const applicationRepository = require("../repositories/ApplicationRepository");
const reviewRepository = require("../repositories/ReviewRepository");

const router = express.Router();

router.get("/dashboard", requireUser, (req, res) => {
  const applications = applicationRepository.findByUserId(req.session.user.id);
  const reviews = reviewRepository.findByUserId(req.session.user.id);
  const reviewableApplications = applicationRepository.findCompletedByUserId(
    req.session.user.id
  );

  res.render("cabinet/index", {
    pageTitle: "Личный кабинет",
    applications,
    reviews,
    reviewableApplications,
    errors: [],
    reviewForm: {
      applicationId: reviewableApplications[0]?.id || "",
      rating: "5",
      content: "",
    },
  });
});

router.post(
  "/reviews",
  requireUser,
  [
    body("applicationId").isInt({ min: 1 }).withMessage("Выберите заявку для отзыва."),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Оценка должна быть от 1 до 5."),
    body("content")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Текст отзыва должен содержать не менее 10 символов."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    const reviewableApplications = applicationRepository.findCompletedByUserId(
      req.session.user.id
    );
    const allowedIds = reviewableApplications.map((item) => item.id);

    if (!errors.isEmpty() || !allowedIds.includes(Number(req.body.applicationId))) {
      const applications = applicationRepository.findByUserId(req.session.user.id);
      const reviews = reviewRepository.findByUserId(req.session.user.id);
      const customErrors = errors.array();

      if (!allowedIds.includes(Number(req.body.applicationId))) {
        customErrors.push({
          msg: "Отзыв можно оставить только по завершенной заявке без уже созданного отзыва.",
        });
      }

      return res.status(422).render("cabinet/index", {
        pageTitle: "Личный кабинет",
        applications,
        reviews,
        reviewableApplications,
        errors: customErrors,
        reviewForm: {
          applicationId: req.body.applicationId || "",
          rating: req.body.rating || "5",
          content: req.body.content || "",
        },
      });
    }

    reviewRepository.create({
      userId: req.session.user.id,
      applicationId: Number(req.body.applicationId),
      rating: Number(req.body.rating),
      content: req.body.content.trim(),
    });

    req.flash("success", "Отзыв сохранен.");
    return res.redirect("/dashboard");
  }
);

module.exports = router;
