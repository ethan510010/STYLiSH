const express = require('express');

const router = express.Router();
const { recordOrderInfo } = require('../../controller/v1/order');

router.post('/order/checkout', recordOrderInfo);

module.exports = router;
