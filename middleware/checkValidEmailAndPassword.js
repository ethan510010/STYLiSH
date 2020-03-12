const rp = require('request-promise');
const {
  searchUser,
  searchUserByHashedFBToken,
  updateUserToken,
  updateFBTokenAndInfo,
  updateFBProfile,
} = require('../Model/v1/user');
const { handleAccessTokenAndRemainingTime } = require('../common/common');
const UserResponseModel = require('../responseModel/userResponse');

const checkValidEmailAndPassword = async (req, res, next) => {
  const { provider, email, password } = req.body;
  const fbLoginToken = req.body.access_token;
  const {
    newAccessToken, expiredTimeRange, tokenExpiredDate, hashedResult,
  } = handleAccessTokenAndRemainingTime(provider,
    email,
    password,
    1,
    fbLoginToken);
  if (provider === 'native') {
    const searchUserResult = await searchUser(
      email,
      hashedResult,
    );
    if (searchUserResult) {
      const updateUserTokenResult = await updateUserToken(provider,
        searchUserResult.id,
        newAccessToken,
        tokenExpiredDate);
      if (updateUserTokenResult === 'updateSuccess') {
        const userResModel = new UserResponseModel(
          newAccessToken,
          expiredTimeRange * 60,
          searchUserResult.id,
          provider,
          searchUserResult.native_user_name,
          searchUserResult.native_user_email,
          searchUserResult.native_user_picture,
        );
        res.json({
          data: userResModel.assembleSignInSignUpRes(),
        });
      }
    } else {
      res.send('請確定帳號密碼正確');
    }
  } else if (provider === 'facebook') {
    const searchUserByFBOriginalTokenResult = await searchUserByHashedFBToken(hashedResult);
    if (searchUserByFBOriginalTokenResult.length > 0) {
      const { userId } = searchUserByFBOriginalTokenResult[0];
      const updateResult = await updateFBTokenAndInfo(userId,
        provider,
        newAccessToken,
        tokenExpiredDate,
        hashedResult);
      if (updateResult) {
        const options = {
          uri: 'https://graph.facebook.com/me',
          qs: {
            fields: 'id,name,email,picture',
            access_token: fbLoginToken,
          },
          json: true,
        };
        const fbResponse = await rp(options);
        const fbUserName = fbResponse.name;
        const fbPicture = fbResponse.picture.data.url;
        const fbEmail = fbResponse.email;
        const updateFBProfileResult = await updateFBProfile(userId,
          fbUserName,
          fbPicture,
          fbEmail);
        if (updateFBProfileResult.affectedRows > 0) {
          res.json({
            data: {
              access_token: newAccessToken,
              access_expired: tokenExpiredDate,
              user: {
                id: userId,
                provider: 'facebook',
                name: fbUserName,
                email: fbEmail,
                picture: fbPicture,
              },
            },
          });
        }
      }
    } else {
      next();
    }
  }
};

module.exports = {
  checkValidEmailAndPassword,
};
