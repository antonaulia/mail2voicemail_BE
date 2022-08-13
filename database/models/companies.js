const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Company extends Model { }
  Company.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(64),
      unique: true,
      allowNull: false,
    },
    basePath: {
      type: DataTypes.STRING(64),
      unique: true,
      allowNull: false,
    },
    storageSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
    },
  }, {
    sequelize,
    tableName: 'companies',
    modelName: 'company',
    timestamps: true,
    updatedAt: false,
  });

  return Company;
};
