const { exec, escape, execTransactionForUserAndNativeUserInfoOrFBUserInfo } = require('../../db/mysql');

// 創建user
const createUser = (
  provider,
  username,
  password,
  email,
  picture,
  token,
  expiredDateTimeStamp,
) => {
  const insertUserSQL = `
            insert into user SET
            access_token='${token}',
            expired_date=${expiredDateTimeStamp}, 
            provider='${provider}'
        `;
  const insertNativeUserInfoSQL = `
            insert into native_user_info SET
            native_user_name='${username}',
            native_user_password='${password}',
            native_user_email='${email}',
            native_user_picture='${picture}',
            user_id=?
        `;
  const resultPromise = execTransactionForUserAndNativeUserInfoOrFBUserInfo(insertUserSQL, insertNativeUserInfoSQL);
  return resultPromise;
};

const getUserInfoWithJoin = (provider, outerkeyId) => {
  let sql = '';
  if (provider === 'native') {
    sql = `
            select 
            user.id as userId, 
            user.access_token, 
            user.expired_date, 
            native_user_info.id as outerkeyId, 
            native_user_info.native_user_name, 
            native_user_info.native_user_email,
            native_user_info.native_user_picture 
            from user 
            inner join native_user_info on user.id=native_user_info.user_id where native_user_info.id=${outerkeyId};
        `;
  }
  const resultPromise = exec(sql);
  return resultPromise;
};

// 創建user時，先判斷name有沒有重複
const searchUserByInputEmail = (inputEmail) => {
  const sql = `        
        select native_user_info.native_user_email as email from user
        inner join 
        native_user_info
        on user.id=native_user_info.user_id 
        where native_user_info.native_user_email='${inputEmail}';
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

// 登入時更新token
const updateUserToken = async (provider, userId, newToken, newTokenExpiredDateTimeStr) => {
  const sql = `
        update user set 
        access_token='${newToken}',
        provider='${provider}',
        expired_date='${newTokenExpiredDateTimeStr}'
        where id=${userId}
    `;
  const updateResult = await exec(sql);
  if (updateResult.affectedRows > 0) {
    return 'updateSuccess';
  }
  return 'failure';
};

// 登入時查詢用戶
const searchUser = async (email, password) => {
  const sql = `   
            select user.id, 
            native_user_info.native_user_name, 
            native_user_info.native_user_email, 
            native_user_info.native_user_picture from user
            inner join native_user_info
            on user.id=native_user_info.user_id 
            where native_user_info.native_user_email='${email}' and native_user_info.native_user_password='${password}'
        `;
  const searResults = await exec(sql);
  console.log(searResults)
  if (searResults.length > 0) {
    return searResults[0];
  }
};

// 登入時check fb的token是否是相同的
const searchUserByFBOriginalToken = (hashed_fb_token) => {
  const sql = `
        select user.id as userId from user
        where hashed_fb_token='${hashed_fb_token}'
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

// FB登入時要先把對應的資料插入user table
const insertFbLoginUserTable = (provider, our_server_encrypt_token, expired_date, hashed_fb_token) => {
  const sql = `
        insert into user SET
        access_token='${our_server_encrypt_token}',
        expired_date='${expired_date}',
        provider='${provider}',
        hashed_fb_token='${hashed_fb_token}'
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

// update user table
const updateFBTokenAndInfo = (userid, provider, ourServerEncryptToken, expiredDate, hashedFbToken) => {
  const sql = `
        update user SET
        access_token='${ourServerEncryptToken}',
        expired_date='${expiredDate}',
        provider='${provider}',
        hashed_fb_token='${hashedFbToken}'
        where id=${userid}
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

// FB登入拿到FB個資後存到fb_user_info table中
const insertFBProfile = (userId, fbUserName, fbUserPicture, fbUserEmail) => {
  const sql = `
        insert into fb_user_info SET 
        user_id=${userId},
        fb_name='${fbUserName}',
        fb_picture='${fbUserPicture}',
        fb_email='${fbUserEmail}'
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

// 更新FB table的資料
const updateFBProfile = (userId, fbUserName, fbUserPicture, fbEmail) => {
  const sql = `
        update fb_user_info SET
        fb_name='${fbUserName}',
        fb_picture='${fbUserPicture}',
        fb_email='${fbEmail}'
        where user_id=${userId}
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

// getProfile的邏輯
const getProfileByAccessTokenAndProvider = async (accessToken, provider) => {
  let sql = '';
  if (provider === 'native') {
    sql = `
            select user.id, 
            user.access_token, 
            user.expired_date, 
            user.provider,
            native_user_info.native_user_name as username, 
            native_user_info.native_user_email as userEmail, 
            native_user_info.native_user_picture as userPicture
            from user inner join native_user_info 
            on user.id=native_user_info.user_id
            where access_token='${accessToken}'
        `;
  } else if (provider === 'facebook') {
    sql = `
            select user.id, 
            user.access_token, 
            user.expired_date, 
            user.provider,
            fb_user_info.fb_name as username,
            fb_user_info.fb_email as userEmail,
            fb_user_info.fb_picture as userPicture
            from user inner join fb_user_info
            on user.id=fb_user_info.user_id
            where access_token='${accessToken}'
        `;
  }
  // eslint-disable-next-line no-useless-catch
  try {
    const queryResults = await exec(sql);
    return queryResults[0];
  } catch (error) {
    throw error;
  }
};

// getProviderFromToken
const getProviderFromToken = async (accessToken) => {
  const sql = `
        select provider from user 
        where access_token='${accessToken}'
    `;
  // eslint-disable-next-line no-useless-catch
  try {
    const queryResults = await exec(sql);
    return queryResults[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  searchUser,
  updateUserToken,
  getProfileByAccessTokenAndProvider,
  searchUserByInputEmail,
  getUserInfoWithJoin,
  insertFbLoginUserTable,
  insertFBProfile,
  searchUserByHashedFBToken: searchUserByFBOriginalToken,
  updateFBTokenAndInfo,
  updateFBProfile,
  getProviderFromToken,
};
