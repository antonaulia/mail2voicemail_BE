module.exports = (options) => (req, res, next) => {
  let permission;

  if (options.permission instanceof Array) {
    permission = options.permission;
  } else if (typeof options.permission === 'string') {
    permission = [options.permission];
  } else {
    throw new Error('Options must be permissions array');
  }

  // check if user bearer type has type of
  if (!permission.includes(req.auth.type)) {
    res.status(403).json({ meta: { message: 'Forbidden access' } });
  }
  // continue
  next();
};
