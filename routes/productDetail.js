const express = require('express');

const router = express.Router();

const { getSpecifiedProductDetail } = require('../controller/productDetail');

router.get('/product.html', getSpecifiedProductDetail);

module.exports = router;
