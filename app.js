const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

const originalRouter = require('./routes/original');
const productUIRouter = require('./routes/productDetail');
const usersRouter = require('./routes/v1/user');
const adminRouter = require('./routes/admin');
const searchRouter = require('./routes/search');

// 提供給前端用的router
const v1ProductsRouter = require('./routes/v1/product');
const v1MarketingRouter = require('./routes/v1/marketing');
const v1OrderRouter = require('./routes/v1//order');

const app = express();
// aws 設定
aws.config.update({
  secretAccessKey: process.env.awsSecretKey,
  accessKeyId: process.env.awsAccessKeyId,
  region: 'us-east-2',
});
const awsS3 = new aws.S3();
// multer儲存設定
// const fileStorage = multer.diskStorage({
//   destination(req, file, callback) {
//     callback(null, 'public/images');
//   },
//   filename(req, file, callback) {
//     callback(null, `${Date.now()}-${file.originalname}`);
//   },
// });
const fileStorage = multerS3({
  s3: awsS3,
  bucket: 'practicestylish',
  acl: 'public-read',
  key: function (req, file, callback) {
    callback(null, `${Date.now()}_${file.originalname}`);
  },
  metadata: function (req, file, callback) {
    callback(null, {fieldName: file.fieldname});
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
});

// multer可以儲存的圖片格式
// const fileFilter = function (req, file, callback) {
//   if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
//     callback(null, true);
//   } else {
//     callback(null, false);
//   }
// };

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 使用multer來處理multipart/form-data
app.use(
  multer({ storage: fileStorage }).fields([
    {
      name: 'product_main_image',
      maxCount: 1,
    },
    {
      name: 'product_sub_images',
      maxCount: 4,
    },
    {
      name: 'campaign_picture',
      maxCount: 1,
    },
  ]),
);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/images', express.static(path.join(__dirname, 'public/images')));

// 利用ejs render頁面
// 下面這行只是要測試用，需要時取消註解
app.use('/original', originalRouter);

app.use('/', productUIRouter);

app.use('/api/v1/user', usersRouter);
app.use('/admin', adminRouter);
app.use('/search', searchRouter);

// 文件寫可以用 array 把多個 router 放進去
app.use('/api/v1', [v1MarketingRouter, v1ProductsRouter, v1OrderRouter]);
// app.use('/api/v1', v1ProductsRouter);
// app.use('/api/v1', v1MarketingRouter);
// app.use('/api/v1', v1OrderRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
