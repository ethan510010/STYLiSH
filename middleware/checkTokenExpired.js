const {
  getProviderFromToken,
  getProfileByAccessTokenAndProvider,
} = require('../Model/v1/user');

const checkTokenExpired = async (req, res, next) => {
  const accessToken = req.headers.authorization.replace('Bearer ', '');
  try {
    const { provider } = await getProviderFromToken(accessToken);
    if (provider) {
      const userInfoData = await getProfileByAccessTokenAndProvider(accessToken, provider);
      if (userInfoData) {
        const nowDate = Date.now();
        const tokenExpiredTime = userInfoData.expired_date;
        if (tokenExpiredTime > nowDate) {
          req.userInfo = userInfoData;
          next();
        } else {
          res.send('請重新登入');
        }
        return;
      }
      res.send('用戶不存在');
    }
  } catch (err) {
    console.log('token搜尋用戶失敗');
  }
};

module.exports = {
  checkTokenExpired,
};
