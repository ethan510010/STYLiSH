require('dotenv').config();
const rp = require('request-promise');

const {
  createUser,
  getUserInfoWithJoin,
  insertFbLoginUserTable,
  insertFBProfile,
} = require('../../Model/v1/user');
const UserResponseModel = require('../../responseModel/userResponse');
const { handleAccessTokenAndRemainingTime } = require('../../common/common');

// 登入
const userSignin = async (req, res) => {
  const { provider, email, password } = req.body;
  const fbLoginToken = req.body.access_token;
  const {
    newAccessToken, tokenExpiredDate, hashedResult,
  } = handleAccessTokenAndRemainingTime(provider, email, password, 1, fbLoginToken);
  // 要更新token
  try {
    if (provider === 'facebook') {
      const fbLoginInsertUserTableResult = await insertFbLoginUserTable(provider,
        newAccessToken,
        tokenExpiredDate,
        hashedResult);
      if (fbLoginInsertUserTableResult.affectedRows > 0) {
        const insertUserId = fbLoginInsertUserTableResult.insertId;
        // 打 request 拿取 fb 個資並存入DB
        const options = {
          uri: 'https://graph.facebook.com/me',
          qs: {
            fields: 'id,name,email,picture',
            access_token: fbLoginToken,
          },
          json: true,
        };
        const fbResponse = await rp(options);
        // 把FB個資存到DB
        const fbUserName = fbResponse.name;
        const fbPicture = fbResponse.picture.data.url;
        const fbEmail = fbResponse.email;
        const insertFBUserProfileResult = await insertFBProfile(insertUserId,
          fbUserName,
          fbPicture,
          fbEmail);
        if (insertFBUserProfileResult.affectedRows > 0) {
          res.json({
            data: {
              access_token: newAccessToken,
              access_expired: tokenExpiredDate,
              user: {
                id: insertUserId,
                provider: 'facebook',
                name: fbUserName,
                email: fbEmail,
                picture: fbPicture,
              },
            },
          });
        }
      }
    }
  } catch (err) {
    console.log('更新用戶token失敗');
    throw err;
  }
};
// 註冊
const userSignup = async (req, res) => {
  // provider這邊先寫死
  const provider = 'native';
  // picture也先寫死
  const picture = 'https://school.appworks.tw/wp-content/uploads/2018/09/cropped-AppWorks-School-Logo-thumb.png';
  const { name, email, password } = req.body;
  // token生成
  const {
    newAccessToken, expiredTimeRange, tokenExpiredDate, hashedResult,
  } = handleAccessTokenAndRemainingTime(provider, email, password, 1, '');
  try {
    const creatUserResult = await createUser(provider,
      name,
      hashedResult,
      email,
      picture,
      newAccessToken,
      tokenExpiredDate);
    if (creatUserResult.affectedRows > 0) {
      const getInsertUserResults = await getUserInfoWithJoin(provider, creatUserResult.insertId);
      const getInsertUserResult = getInsertUserResults[0];
      const userResModel = new UserResponseModel(newAccessToken,
        expiredTimeRange * 60,
        getInsertUserResult.userId,
        provider,
        getInsertUserResult.native_user_name,
        getInsertUserResult.native_user_email,
        getInsertUserResult.native_user_picture);
      res.json({
        data: userResModel.assembleSignInSignUpRes(),
      });
    }
  } catch (err) {
    console.log('創建User錯誤');
    throw err;
  }
};

const getUserProfie = async (req, res) => {
  const { userInfo } = req;
  res.json({
    data: {
      id: userInfo.id,
      provider: userInfo.provider,
      name: userInfo.username,
      email: userInfo.userEmail,
      picture: userInfo.userPicture,
    },
  });
};

module.exports = {
  userSignin,
  userSignup,
  getUserProfie,
};
