const { getMerketingCampaignsFromCache } = require('../Model/v1/marketing');

const marketingCache = async (req, res, next) => {
  const marketingCacheResult = await getMerketingCampaignsFromCache();
  if (marketingCacheResult !== null) {
    console.log('marketing campaigns有值', marketingCacheResult);
    const marketingCampaings = JSON.parse(marketingCacheResult);
    res.json({
      data: marketingCampaings,
    });
  } else {
    console.log('marketing campaingcache 沒有值');
    next();
  }
};

module.exports = {
  marketingCache,
};
