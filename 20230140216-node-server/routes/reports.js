const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { addUserData, isAdmin } = require('../middleware/permissionMiddleware');

router.get('/daily', [addUserData, isAdmin, reportController.getDailyReport]);
router.get('/', addUserData, reportController.getDailyReport);

module.exports = router;