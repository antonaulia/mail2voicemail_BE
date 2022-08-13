const { Company } = require('../database');

const NewCompanyValidator = {
  name: {
    isLength: {
      options: {
        min: 5,
        max: 64,
      },
    },
    custom: {
      options: (value) => Company.findOne({ where: { name: value } }).then((company) => {
        if (company) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Company name already in use');
        }
      }),
    },
  },
  base_path: {
    isAlphanumeric: true,
    isLength: {
      options: {
        min: 5,
        max: 64,
      },
    },
  },
  storage_size: {
    isInt: {
      options: {
        min: 1,
        allow_leading_zero: false,
      },
    },
    toInt: true,
  },
  'admin.username': {
    isLength: {
      options: {
        min: 5,
        max: 64,
      },
    },
  },
  'admin.email': {
    isEmail: true,
  },
  'admin.password': {
    isLength: {
      options: {
        min: 8,
        max: 32,
      },
    },
  },
  'admin.storage_size': {
    isInt: {
      options: {
        min: 1,
        allow_leading_zero: false,
      },
    },
    toInt: true,
  },
  users: {
    isArray: {
      options: { min: 1 },
      bail: true,
    },
  },
  'users.*.username': {
    isLength: {
      options: {
        min: 5,
        max: 64,
      },
    },
  },
  'users.*.email': {
    isEmail: true,
  },
  'users.*.password': {
    isLength: {
      options: {
        min: 8,
        max: 32,
      },
    },
  },
  'users.*.storage_size': {
    isInt: {
      options: {
        min: 1,
        allow_leading_zero: false,
      },
    },
    toInt: true,
  },
};

module.exports = { NewCompanyValidator };
