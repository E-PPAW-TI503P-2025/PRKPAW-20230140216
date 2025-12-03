const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { addUserData } = require('../middleware/permissionMiddleware');

router.use(addUserData);
router.get('/search-date', presensiController.searchByDate);
router.post('/check-in', presensiController.upload.single('image'), presensiController.CheckIn);
router.post('/check-out', presensiController.upload.single('image'), presensiController.CheckOut);
router.put('/:id', presensiController.updatePresensi); 
router.delete('/:id', presensiController.deletePresensi); 

module.exports = router;