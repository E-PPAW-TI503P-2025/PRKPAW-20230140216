'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Presensi extends Model {
    static associate(models) {
      Presensi.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  
  Presensi.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    checkIn: {
      type: DataTypes.DATE
    },
    checkOut: {
      type: DataTypes.DATE
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    buktiFoto: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Presensi',
  });
  
  return Presensi;
};