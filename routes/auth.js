const express = require('express');
const { validationResult } = require('express-validator');
const { checkSchema } = require('express-validator');
const jose = require('jose');
const { verifyPassword } = require('../helpers/password');
const { privateKey } = require('../configs/jwtKeys');
const { User, Company } = require('../database');
const { LoginValidator } = require('../validators/users');
const { responseConstruct } = require('../helpers/constructor');

const router = express.Router();

/**
 * user login
 */
router.post(
  '/login',
  checkSchema(LoginValidator),
  async (req, res, next) => {
    // check validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // get user
    const user = await User.findOne({
      where: { email: req.body.email },
      include: [Company],
    });

    // if cannot find user or password verification failed
    if (user == null || !verifyPassword(req.body.password, user.password)) {
      res.status(403).json({ meta: { message: 'invalid email or password' } });
      // cut off process
      return next();
    }

    // read and import private key
    const key = await jose.importPKCS8(privateKey, 'RS256');

    // generate jwt
    const jwt = await new jose.SignJWT({
      userId: user.id,
      company: user.companyId,
      type: user.role,
    }).setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setAudience('mail2voicemail.com')
      .setIssuer('mail2voicemail.com')
      .setExpirationTime(process.env.EXP || '60m')
      .sign(key);

    const data = {
      username: user.username,
      email: user.email,
      role: user.role,
      companyId: user.Company ? user.Company.id : null,
      companyName: user.Company ? user.Company.name : null,
      token: jwt,
    };

    res.json(responseConstruct('login success', data));
  },
);

module.exports = router;
