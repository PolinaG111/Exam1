function sessionMiddleware(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.isAdmin = Boolean(req.session.admin);
  res.locals.currentPath = req.path;
  res.locals.generalErrors = [];
  next();
}

module.exports = {
  sessionMiddleware,
};
