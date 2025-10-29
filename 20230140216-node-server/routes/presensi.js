const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { addUserData } = require('../middleware/permissionMiddleware');
router.use(addUserData);
router.post('/check-in', presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);
router.put('/presensi/:id', presensiController.updatePresensi);
router.delete('/presensi/:id', presensiController.deletePresensi);

module.exports = router;