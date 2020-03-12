const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {
    title: 'EJS Template',
    test: '<h3>測試</h3>',
    description: 'Ejs嘗試',
    show: true,
    course: ['html', 'css', 'js'],
  });
});

module.exports = router;
