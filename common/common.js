const crypto = require('crypto');

const generateImagePrefix = (req) => {
  const imagePrefixUrl = `${req.protocol}://${req.hostname}:${req.socket.localPort}`;
  return imagePrefixUrl;
};

const hashedInfo = (provider, email, passwordOrFBToken, expiredTimeRange) => {
  const hashKeyForPassowrdAndFBToken = crypto.createHash('sha256', process.env.secret);
  const hashedResult = hashKeyForPassowrdAndFBToken.update(passwordOrFBToken).digest('hex');
  const nowTimeStamp = Date.now();
  let tokenBaseStr = '';
  let newAccessToken = '';
  if (provider === 'native') {
    const sha256EncriptForNativeLogin = crypto.createHash('sha256', process.env.secret);
    tokenBaseStr = email + nowTimeStamp;
    newAccessToken = sha256EncriptForNativeLogin.update(tokenBaseStr).digest('hex');
  } else if (provider === 'facebook') {
    const sha256EncriptForFBLogin = crypto.createHash('sha256', process.env.secret);
    tokenBaseStr = passwordOrFBToken + nowTimeStamp;
    newAccessToken = sha256EncriptForFBLogin.update(tokenBaseStr).digest('hex');
  }
  const tokenExpiredDate = nowTimeStamp + expiredTimeRange * 60000;
  return {
    newAccessToken,
    expiredTimeRange,
    tokenExpiredDate,
    hashedResult,
  };
};

const handleAccessTokenAndRemainingTime = (
  provider,
  email,
  originalPassword,
  expiredTimeRange,
  fbOriginalToken,
// eslint-disable-next-line consistent-return
) => {
  if (provider === 'native') {
    return hashedInfo(provider, email, originalPassword, expiredTimeRange);
  }
  if (provider === 'facebook') {
    return hashedInfo(provider, '', fbOriginalToken, expiredTimeRange);
  }
};

module.exports = {
  generateImagePrefix,
  handleAccessTokenAndRemainingTime,
};
