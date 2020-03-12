const express = require('express');
const { productDetailCache } = require('../../middleware/productCache');

const router = express.Router();
const { queryAllProducts } = require('../../controller/v1/product');

router.get('/products/:endPoint', productDetailCache, queryAllProducts);

module.exports = router;
