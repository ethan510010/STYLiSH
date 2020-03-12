const express = require('express');
const { marketingCache } = require('../../middleware/marketingCache');
const clientSideNocache = require('../../middleware/nocache');

const router = express.Router();
const { queryAllCampaigns } = require('../../controller/v1/marketing');
// 這邊到時會先加一個 cache 的 middleware
router.get('/marketing/:endPoint', marketingCache, queryAllCampaigns);

module.exports = router;
