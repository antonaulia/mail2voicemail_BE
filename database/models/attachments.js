const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Attachment extends Model { }
  Attachment.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    length: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    series: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    path: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
  }, {
    sequelize,
    tableName: 'attachments',
    modelName: 'attachment',
    timestamps: false,
  });

  return Attachment;
};
