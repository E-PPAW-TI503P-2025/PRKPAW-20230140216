const { Presensi,Sequelize } = require("../models");
const { Op } = Sequelize;
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

const isValidDate = (dateString) => {
    if (!dateString) return true; 
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date); 
};

exports.CheckIn = async (req, res) => {
  // 2. Gunakan try...catch untuk error handling
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    // 3. Ubah cara mencari data menggunakan 'findOne' dari Sequelize
    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    // 4. Ubah cara membuat data baru menggunakan 'create' dari Sequelize
    const newRecord = await Presensi.create({
      userId: userId,
      nama: userName,
      checkIn: waktuSekarang,
    });
    
    const formattedData = {
        userId: newRecord.userId,
        nama: newRecord.nama,
        checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
        checkOut: null
    };

    res.status(201).json({
      message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut, nama } = req.body;
    if (checkIn && !isValidDate(checkIn)) {
        return res.status(400).json({
            success: false,
            message: "Format tanggal CheckIn tidak valid. Gunakan format yang benar."
        });
    }
    if (checkOut && !isValidDate(checkOut)) {
        return res.status(400).json({
            success: false,
            message: "Format tanggal CheckOut tidak valid. Gunakan format yang benar (yyyy-mm-dd)."
        });
    }
    if (checkIn === undefined && checkOut === undefined && nama === undefined) {
      return res.status(400).json({
        message:
          "Request body tidak berisi data yang valid untuk diupdate (checkIn, checkOut, atau nama).",
      });
    }
    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    recordToUpdate.nama = nama || recordToUpdate.nama;
    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};


exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;
    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }
    if (recordToDelete.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }
    await recordToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};


exports.CheckOut = async (req, res) => {
  // Gunakan try...catch
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    // Cari data di database
    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    // 5. Update dan simpan perubahan ke database
    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    const formattedData = {
        userId: recordToUpdate.userId,
        nama: recordToUpdate.nama,
        checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
        checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
    };

    res.json({
      message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.searchByDate = async (req, res) => {
    // 1. Ambil query parameter 'date' (diharapkan format YYYY-MM-DD)
    const { date } = req.query; 

    // Cek apakah parameter 'date' ada
    if (!date) {
        return res.status(400).json({
            success: false,
            message: "Parameter 'date' diperlukan untuk pencarian (format: YYYY-MM-DD)."
        });
    }
    
    try {
        // 2. Tentukan batas waktu untuk pencarian di kolom DATETIME
        // Start of the day (00:00:00)
        // Gunakan 'T00:00:00.000Z' untuk memastikan interpretasi UTC yang konsisten
        const startDate = new Date(`${date}T00:00:00.000Z`); 
        // End of the day (23:59:59.999)
        const endDate = new Date(`${date}T23:59:59.999Z`); 

        // Cek validitas tanggal
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD."
            });
        }

        // 3. Lakukan pencarian di database menggunakan Op.between pada kolom checkIn
        const results = await Presensi.findAll({
            where: {
                checkIn: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // 4. Beri respons dengan hasil pencarian
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Tidak ditemukan data presensi pada tanggal ${date}.`
            });
        }

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        // 5. Penanganan error server
        console.error("Error saat mencari presensi berdasarkan tanggal:", error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan server saat melakukan pencarian berdasarkan tanggal.",
            error: error.message
        });
    }
};
