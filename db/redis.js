const redis = require('redis');
const { redisConfig } = require('../config/db');

const redisClient = redis.createClient(redisConfig);

redisClient.on('connect', () => {
  console.log('redis connection成功');
});

redisClient.on('error', (err) => {
  console.log('redis connection錯誤', err);
});

module.exports = redisClient;
