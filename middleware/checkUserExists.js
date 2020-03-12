const {
  searchUserByInputEmail,
} = require('../Model/v1/user');

const checkRepeatedEmail = async (req, res, next) => {
  const { email } = req.body;
  try {
    const searchRepeatedUsersByEmail = await searchUserByInputEmail(email);
    if (searchRepeatedUsersByEmail.length > 0) {
      res.send('該用戶email已存在，請換其他email註冊');
    } else {
      next();
    }
  } catch (err) {
    console.log('判斷是不是有重複的name的時候有錯誤');
    throw err;
  }
};

module.exports = {
  checkRepeatedEmail,
};
