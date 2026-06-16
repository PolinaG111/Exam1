function sessionMiddleware(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.isAdmin = Boolean(req.session.admin);
  res.locals.currentPath = req.path;
  next();
}

module.exports = {
  sessionMiddleware,
};
