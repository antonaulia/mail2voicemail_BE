const express = require('express');
const { checkSchema, validationResult } = require('express-validator');
const { Op, Sequelize } = require('sequelize');
const {
  Company, EmailAddress, User, CompanyUser,
} = require('../database');
const validPermission = require('../middlewares/validPermission');
const { responseConstruct } = require('../helpers/constructor');
const { NewCompanyValidator } = require('../validators/companies');
const ejwt = require('../middlewares/extendedJWT');

const router = express.Router();
router.use(ejwt());

/**
 * List all company
 */
router.get(
  '/',
  validPermission({ permission: 'superadmin' }),
  checkSchema(NewCompanyValidator),
  async (req, res) => {
    const data = [];
    const { search } = req.query;
    const dbQuery = {
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('Users.id')), 'user_count']],
      },
      group: ['Company.id', 'EmailAddresses.id', 'Users.id'],
      include: [EmailAddress, {
        model: User,
        attributes: [],
      }],
      order: [['createdAt', 'DESC']],
    };

    // add search inside query if not null
    if (search) {
      dbQuery.where = {
        name: {
          [Op.substring]: search,
        },
      };
    }

    // find all companies and their email addresses
    const companies = await Company.findAll(dbQuery);

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];

      const emails = [];
      for (let x = 0; x < company.EmailAddresses.length; x++) {
        const email = company.EmailAddresses[x];
        emails.push(email.email_dest);
      }

      data.push({
        id: company.id,
        name: company.name,
        email_dest: emails,
        base_path: company.base_path,
        storage_size: company.storageSize,
        user_count: company.dataValues.user_count,
        created_at: company.createdAt,
      });
    }

    res.json(responseConstruct('success', data));
  },
);

/**
 * Get single company
 */
router.get(
  '/:companyId',
  validPermission({ permission: 'superadmin' }),
  async (req, res) => {
    // Getting company info with companyId
    const company = await Company.findByPk(req.params.companyId, {
      attributes: {
        include: [[Sequelize.fn('COUNT', Sequelize.col('Users.id')), 'user_count']],
      },
      group: ['Company.id', 'EmailAddresses.id', 'Users.id'],
      include: [EmailAddress, {
        model: User,
        attributes: [],
      }],
    });

    // check if company not found
    if (!company) {
      return res.status(404).json(responseConstruct('Target company not found'));
    }

    const emails = [];
    for (let x = 0; x < company.EmailAddresses.length; x++) {
      const email = company.EmailAddresses[x];
      emails.push(email.email_dest);
    }

    const data = {
      id: company.id,
      name: company.name,
      email_dest: emails,
      base_path: company.base_path,
      storage_size: company.storageSize,
      user_count: company.dataValues.user_count,
      created_at: company.createdAt,
    };

    res.json(responseConstruct('success', data));
  },
);

/**
 * Create new company
 */
router.post(
  '/',
  validPermission({ permission: 'superadmin' }),
  checkSchema(NewCompanyValidator),
  async (req, res) => {
    // check for error when validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { body } = req;
    const users = [{
      username: body.admin.username,
      email: body.admin.email,
      password: body.admin.password,
      storage: body.admin.storage_size,
      role: 'company_admin',
    }];

    for (let i = 0; i < body.users.length; i++) {
      const user = body.users[i];

      users.push({
        username: user.username,
        email: user.email,
        password: user.password,
        storage: user.storage_size,
        role: 'company_user',
      });
    }

    // create company database instance
    const company = await Company.create({
      name: body.name,
      basePath: body.base_path,
      storageSize: body.storage_size,
      users,
    }, {
      include: [CompanyUser],
    });

    const data = {
      id: company.id,
      name: company.name,
      base_path: company.base_path,
      storage_size: company.storageSize,
      user_count: 0,
      created_at: company.createdAt,
    };

    res.json(responseConstruct('company created', data));
  },
);

module.exports = router;
