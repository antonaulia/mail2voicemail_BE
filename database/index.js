const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
  },
);

const Company = require('./models/companies')(sequelize);
const User = require('./models/users')(sequelize);
const Email = require('./models/emails')(sequelize);
const Attachment = require('./models/attachments')(sequelize);

// Company to user association
const CompanyUser = Company.hasMany(User);
const UserCompany = User.belongsTo(Company, {
  onDelete: 'CASCADE',
  foreignKey: {
    allowNull: true,
  },
});

// Company to email association
const CompanyEmail = Company.hasMany(Email);
const EmailCompany = Email.belongsTo(Company, {
  onDelete: 'CASCADE',
});

// User to User association
User.hasMany(User, { foreignKey: 'createdBy' });
User.belongsTo(User, {
  onDelete: 'SET NULL',
  foreignKey: {
    name: 'createdBy',
    allowNull: true,
  },
});

// Attachment to EmailData association
const EmailAttachment = Email.hasMany(Attachment);
const AttachmentEmail = Attachment.belongsTo(Email, {
  onDelete: 'CASCADE',
});

module.exports = {
  sequelize,
  Company,
  User,
  Email,
  Attachment,
  CompanyUser,
  UserCompany,
  CompanyEmail,
  EmailCompany,
  EmailAttachment,
  AttachmentEmail,
};
