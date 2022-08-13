const { expressjwt: jwt } = require('express-jwt');
const { publicKey } = require('../configs/jwtKeys');

module.exports = () => (req, res, next) => {
  const handleErrorNext = (err) => {
    if (err) {
      if (err.name === 'UnauthorizedError') {
        res.status(401).json({ meta: { message: 'Unauthorized' } });
      }
    }
    next(err);
  };

  const middleware = jwt({
    secret: publicKey,
    algorithms: ['RS256'],
  });

  middleware(req, res, handleErrorNext);
};
