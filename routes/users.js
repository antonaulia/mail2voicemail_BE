const express = require('express');
const { validationResult } = require('express-validator');
const { checkSchema } = require('express-validator');
const { hashPassword } = require('../helpers/password');
const { User, Company } = require('../database');
const { NewUserValidator } = require('../validators/users');
const validPermission = require('../middlewares/validPermission');
const { responseConstruct } = require('../helpers/constructor');
const ejwt = require('../middlewares/extendedJWT');

const router = express.Router();
router.use(ejwt());

/**
 * Create new User
 * This API is temporarily open. we just wanna test.
 * request body schema
 * {
 *   "username": "string",
 *   "email": "string-unique",
 *   "password": "string",
 *   "company_id": "integer or null - based on company id",
 *   "role": between superadmin, company_admin or company_user
 * }
 */
router.post(
  '/',
  validPermission({ permission: ['superadmin', 'company_admin'] }),
  checkSchema(NewUserValidator),
  async (req, res) => {
    // check for error when validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // check role created according to bearer type
    const permission = req.auth.type;
    if (permission === 'superadmin' && req.body.role === 'company_user') {
      return res
        .status(403)
        .json(responseConstruct('superadmin cannot create company user'));
    } if (permission === 'company_admin' && req.body.role !== 'company_user') {
      return res
        .status(403)
        .json(responseConstruct('company admin can only create company user'));
    }

    const company = await Company.findByPk(req.body.companyId);
    if (!company) {
      return res
        .status(403)
        .json(responseConstruct('Target company not found'));
    }

    // create User database instance
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashPassword(req.body.password),
      role: req.body.role,
      active: true,
      CompanyId: company.id,
      createdBy: req.auth.userId,
    });

    res.json({
      meta: { message: 'User created' },
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        sendTo: user.sendTo,
        active: user.active,
        companyId: user.companyId,
      },
    });
  },
);

module.exports = router;
