const { getProductDetailWithId } = require('../Model/v1/product');

const productDetailCache = async (req, res, next) => {
  const { endPoint } = req.params;
  if (endPoint === 'details') {
    const validId = parseInt(req.query.id);
    const productDetailResult = await getProductDetailWithId(validId);
    if (productDetailResult !== null) {
      console.log('productDetail cache有值', productDetailResult);
      res.json({
        data: JSON.parse(productDetailResult),
      });
    } else {
      console.log('product detail沒有值');
      next();
    }
  } else {
    next();
  }
};

module.exports = {
  productDetailCache,
};
