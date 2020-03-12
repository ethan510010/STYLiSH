const { exec } = require('../db/mysql');

const searchHotActivityList = () => {
  const sql = 'select * from hot;';

  const resultPromise = exec(sql);
  return resultPromise;
};

const searchProductId = () => {
  const sql = 'select id, title from product;';
  const resultPromise = exec(sql);
  return resultPromise;
};

module.exports = {
  searchHotActivityList,
  searchProductId,
};
