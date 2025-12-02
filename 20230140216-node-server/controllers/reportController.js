const { Presensi, User } = require('../models');

exports.getDailyReport = async (req, res) => {
  try {
    const reports = await Presensi.findAll({
      include: [
        {
          model: User,
          as: 'user', 
          attributes: ['nama', 'email', 'role'] 
        }
      ],
      order: [['createdAt', 'DESC']] 
    });

    if (reports.length > 0) {
        console.log("Data pertama ditemukan:", JSON.stringify(reports[0], null, 2));
    } else {
        console.log("Tabel Presensi KOSONG.");
    }

    res.status(200).json(reports);

  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Gagal mengambil data laporan.", error: error.message });
  }
};