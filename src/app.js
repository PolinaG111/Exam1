const path = require("path");
const express = require("express");
const session = require("express-session");

require("./config/database");

const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const cabinetRoutes = require("./routes/cabinetRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { flashMiddleware } = require("./middleware/flashMiddleware");
const { sessionMiddleware } = require("./middleware/sessionMiddleware");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "driving-rf-demo-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);
app.use(flashMiddleware);
app.use(sessionMiddleware);

app.get("/", (req, res) => {
  if (req.session.admin) {
    return res.redirect("/admin/dashboard");
  }

  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  return res.redirect("/login");
});

app.use(authRoutes);
app.use(applicationRoutes);
app.use(cabinetRoutes);
app.use(adminRoutes);

app.use((req, res) => {
  res.status(404).render("partials/status-page", {
    pageTitle: "Страница не найдена",
    title: "404",
    message: "Запрошенная страница не существует.",
    backLink: "/",
    backText: "Вернуться на главную",
  });
});

module.exports = app;
