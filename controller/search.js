const { searchHotActivityList, searchProductId } = require('../Model/search');

const getHotActivity = (req, res) => {
  searchHotActivityList()
    .then((activityList) => {
      res.json(activityList);
    })
    .catch((err) => {
      throw err;
    });
};

const getProductInfo = (req, res) => {
  searchProductId()
    .then((productBriefInfo) => {
      res.json(productBriefInfo);
    })
    .catch((err) => {
      throw err;
    });
};

module.exports = {
  getHotActivity,
  getProductInfo,
};
