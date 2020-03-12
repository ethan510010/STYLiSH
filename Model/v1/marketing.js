const redis = require('redis');
const { exec } = require('../../db/mysql');
const redisClient = require('../../db/redis');

// 撈出所有的Campaigns
const listAllCampaigns = () => {
  const sql = `
        select * from campaign;
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

// 對 campaigns 做 cache 儲存
const setMarketingCampaignsCache = (cacheInfo) => {
  redisClient.setex('marketingCampaigns', 3600, cacheInfo, redis.print);
};

// 從 cache 拿取 campaigns
const getMerketingCampaignsFromCache = () => {
  const marketingCampaingsCachePromise = new Promise((resolve, reject) => {
    redisClient.get('marketingCampaigns', (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
  return marketingCampaingsCachePromise;
};

// 清空cache
const clearMarketingCampaignsCache = () => {
  redisClient.del('marketingCampaigns', redis.print);
};

module.exports = {
  listAllCampaigns,
  setMarketingCampaignsCache,
  getMerketingCampaignsFromCache,
  clearMarketingCampaignsCache,
};
