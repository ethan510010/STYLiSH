const {
  querySpecifiedProductDetail,
  getVariantForSpecifiedProduct,
} = require('../Model/v1/productDetail');

const getSpecifiedProductDetail = async (req, res) => {
  const { id } = req.query;
  if (id) {
    try {
      const imagePrefixUrl = `${req.protocol}://${req.hostname}:${req.socket.localPort}`;
      const {
        mainImage,
        firstImage,
        secondImage,
        productTitle,
        productId,
        price,
        texture,
        productNation,
        productDesc,
        productStory,
      } = await querySpecifiedProductDetail(imagePrefixUrl, id);
      const { uniqueColors, uniqueSizes } = await getVariantForSpecifiedProduct(id);
      res.render('product', {
        title: productTitle,
        prodId: productId,
        prodPrice: `TWD.${price}`,
        colors: uniqueColors,
        sizes: uniqueSizes,
        material: texture,
        nation: productNation,
        desc: productDesc,
        story: productStory,
        main_image: mainImage,
        first_image: firstImage,
        second_image: secondImage,
      });
    } catch (err) {
      res.send('請確定商品id存在');
    }
  } else {
    res.send('請確定有輸入商品id');
  }
};

module.exports = {
  getSpecifiedProductDetail,
};
