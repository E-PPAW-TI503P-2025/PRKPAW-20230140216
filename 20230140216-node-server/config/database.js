const { Sequelize } = require('sequelize');

// Konfigurasi koneksi database
const sequelize = new Sequelize('praktikum_216_db', 'root', null, {
  host: '127.0.0.1',
  dialect: 'mysql',
  logging: console.log, // Aktifkan untuk melihat query SQL
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test koneksi database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Koneksi database berhasil!');
  } catch (error) {
    console.error('✗ Koneksi database gagal:', error.message);
  }
};

module.exports = { sequelize, testConnection };