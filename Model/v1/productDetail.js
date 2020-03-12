const { exec, escape } = require('../../db/mysql');

const querySpecifiedProductDetail = async (imagePrefix, id) => {
  const sql = `
    select id, title, description, price, texture, wash, place, note, story, main_image, GROUP_CONCAT(image_path) as images from 
    (select product.id, title, description, price, texture, wash, place, note, story, main_image, image.image_path from product 
    inner join image 
    on image.product_id=product.id where product.id=${id}) as tempTable
    GROUP BY tempTable.id;
  `;
  const resultPromise = exec(sql);
  try {
    const specifiedProducts = await resultPromise;
    const specifiedProduct = specifiedProducts[0];
    if (specifiedProduct) {
      const mainImage = `${specifiedProduct.main_image}`;
      const subImagesList = specifiedProduct.images.split(',');
      const firstImage = `${subImagesList[0]}`;
      const secondImage = `${subImagesList[1]}`;
      return {
        mainImage,
        firstImage,
        secondImage,
        productTitle: specifiedProduct.title,
        productId: specifiedProduct.id,
        price: specifiedProduct.price,
        texture: specifiedProduct.texture,
        productNation: specifiedProduct.place,
        productDesc: specifiedProduct.description,
        productStory: specifiedProduct.story,
      };
    }
  } catch (error) {
    return error;
  }
};

const getVariantForSpecifiedProduct = async (id) => {
  const sql = `
        select variant.stock, color.name, color.code, size.size_name from variant 
        inner join color on variant.color_id=color.color_id
        inner join size on size.size_id=variant.size_id
        where variant.product_id=${id}
    `;
  const resultPromise = exec(sql);
  try {
    const results = await resultPromise;
    const colors = [];
    const sizes = [];
    results.forEach((eachVariant) => {
      colors.push(eachVariant.code);
      sizes.push(eachVariant.size_name);
    });
    const uniqueColors = Array.from(new Set(colors));
    const uniqueSizes = Array.from(new Set(sizes));
    return {
      uniqueColors,
      uniqueSizes,
    };
  } catch (error) {
    return error;
  }
};

module.exports = {
  querySpecifiedProductDetail,
  getVariantForSpecifiedProduct,
};
