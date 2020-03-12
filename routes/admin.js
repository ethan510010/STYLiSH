const express = require('express');

const router = express.Router();

const {
  addNewProduct,
  uploadVariantForProduct,
  uploadCampaign,
} = require('../controller/admin');
// 商品上傳
router.post('/upload_product_info', addNewProduct);
// 規格上傳
router.post('/upload_variant', uploadVariantForProduct);
// 上傳campaign
router.post('/upload_campaign', uploadCampaign);

module.exports = router;
