function requireUser(req, res, next) {
  if (!req.session.user) {
    req.flash("error", "Для продолжения необходимо войти в систему.");
    return res.redirect("/login");
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    req.flash("error", "Требуется авторизация администратора.");
    return res.redirect("/admin/login");
  }

  return next();
}

module.exports = {
  requireAdmin,
  requireUser,
};
