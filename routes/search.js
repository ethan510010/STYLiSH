const express = require('express');

const router = express.Router();
const { getHotActivity, getProductInfo } = require('../controller/search');

// 查看熱銷活動
router.get('/hotActivity', getHotActivity);

// 查看商品編號
router.get('/productId', getProductInfo);

module.exports = router;
