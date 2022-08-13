const { DataTypes, Model } = require('sequelize');
const { hashPassword } = require('../../helpers/password');

module.exports = (sequelize) => {
  class User extends Model { }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('password', hashPassword(value));
      },
    },
    sendTo: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'send_to',
    },
    storage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('superadmin', 'company_admin', 'company_user'),
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    sequelize,
    tableName: 'users',
    modelName: 'user',
    timestamps: true,
    updatedAt: false,
  });

  return User;
};
