const { User, Company } = require('../database');

const LoginValidator = {
  email: {
    isEmail: {
      normalizeEmail: true,
    },
  },
  password: {
    isString: true,
  },
};

const NewUserValidator = {
  username: {
    isLength: {
      options: {
        min: 5,
        max: 64,
      },
    },
  },
  email: {
    isEmail: {
      normalizeEmail: true,
    },
    custom: {
      options: (value) => User.findOne({ where: { email: value } }).then((user) => {
        if (user) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Email already in use');
        }
      }),
    },
  },
  password: {
    isLength: {
      options: {
        min: 8,
        max: 32,
      },
    },
  },
  role: {
    custom: {
      options: (value) => {
        const role = ['superadmin', 'company_admin', 'company_user'];
        if (!role.includes(value)) {
          throw new Error('Unknown role');
        }
        return value;
      },
    },
  },
  companyId: {
    custom: {
      options: (value, { req }) => {
        if (req.body.role !== 'superadmin' && value == null) {
          throw new Error('You need specify company');
        }
        return value;
      },
    },
    toInt: true,
  },
};

module.exports = { LoginValidator, NewUserValidator };
