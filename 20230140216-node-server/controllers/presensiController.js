const { Presensi, User } = require("../models");
const { Op } = require("sequelize");
const { format } = require("date-fns-tz");
const multer = require('multer'); 
const path = require('path');     
const timeZone = "Asia/Jakarta";

const isValidDate = (dateString) => {
    if (!dateString) return true; 
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date); 
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const CheckIn = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();
    const { latitude, longitude } = req.body;

    const buktiFoto = req.file ? req.file.filename : null; 

    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    const newRecord = await Presensi.create({
      userId: userId,
      checkIn: waktuSekarang,
      latitude: latitude,
      longitude: longitude,
      buktiFoto: buktiFoto 
    });

    const formattedData = {
      userId: newRecord.userId,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      latitude: newRecord.latitude,
      longitude: newRecord.longitude,
      buktiFoto: newRecord.buktiFoto
    };

    res.status(201).json({
      message: `Halo ${userName}, check-in berhasil dengan foto!`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal Check-In", error: error.message });
  }
};

const CheckOut = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();
    const { latitude, longitude } = req.body;
    
    const buktiFoto = req.file ? req.file.filename : null; 

    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    if (latitude) recordToUpdate.latitude = latitude;
    if (longitude) recordToUpdate.longitude = longitude;
    if (buktiFoto) recordToUpdate.buktiFoto = buktiFoto; 

    await recordToUpdate.save();

    const formattedData = {
        userId: recordToUpdate.userId,
        checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
        checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
        latitude: recordToUpdate.latitude,
        longitude: recordToUpdate.longitude,
        buktiFoto: recordToUpdate.buktiFoto
    };

    res.json({
      message: `Selamat jalan ${userName}, check-out berhasil!`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal Check-Out", error: error.message });
  }
};

const deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;
    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }
    if (recordToDelete.userId !== userId) { 
      return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }
    await recordToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

const updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut, latitude, longitude } = req.body;

    if (checkIn && !isValidDate(checkIn)) {
        return res.status(400).json({ message: "Format tanggal CheckIn tidak valid." });
    }
    if (checkOut && !isValidDate(checkOut)) {
        return res.status(400).json({ message: "Format tanggal CheckOut tidak valid." });
    }

    if (checkIn === undefined && checkOut === undefined && latitude === undefined && longitude === undefined) {
      return res.status(400).json({ message: "Request body tidak berisi data yang valid untuk diupdate." });
    }

    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    if(checkIn) recordToUpdate.checkIn = checkIn;
    if(checkOut) recordToUpdate.checkOut = checkOut;
    if(latitude !== undefined) recordToUpdate.latitude = latitude;
    if(longitude !== undefined) recordToUpdate.longitude = longitude;

    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

const searchByDate = async (req, res) => {
  try {
    const { tanggalMulai, tanggalSelesai, nama } = req.query;
    let whereClause = {};
    let userWhereClause = {};

    if (nama) {
      userWhereClause.nama = {
        [Op.like]: `%${nama}%`
      };
    }

    if (tanggalMulai && tanggalSelesai) {
      const dateStart = new Date(tanggalMulai);
      const dateEnd = new Date(tanggalSelesai);
      dateStart.setHours(0, 0, 0, 0);
      dateEnd.setHours(23, 59, 59, 999);
      whereClause.checkIn = { [Op.between]: [dateStart, dateEnd] };
    } 
    else if (tanggalMulai || tanggalSelesai) {
        return res.status(400).json({ message: "Harap berikan kedua tanggalMulai dan tanggalSelesai." });
    }

    const presensiRecords = await Presensi.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        where: userWhereClause,
        attributes: ['id', 'nama', 'email', 'role']
      }],
      order: [['checkIn', 'ASC']],
    });

    res.json({
      message: "Pencarian presensi berhasil.",
      totalRecords: presensiRecords.length,
      data: presensiRecords,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};


module.exports = {
    upload, 
    CheckIn,
    CheckOut,
    deletePresensi,
    updatePresensi,
    searchByDate
};