const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Email extends Model { }
  Email.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    from: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    caller: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    callee: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    callTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sent: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    subject: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    tableName: 'emails',
    modelName: 'email',
    timestamps: false,
  });

  return Email;
};
