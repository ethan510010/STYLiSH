const redis = require('redis');
const { exec } = require('../../db/mysql');
const redisClient = require('../../db/redis');
// const { generateImagePrefix } = require('../../common/common');

const encapsulateProductResponse = async (req, sql) => {
  const productsResult = await exec(sql);
  // const imagePrefix = generateImagePrefix(req);
  const responseProducts = [];
  productsResult.forEach((product) => {
    const originalImages = product.images.split(',');
    const subImages = [];
    const colorList = [];
    const sizeList = [];
    const productVariants = [];

    for (let index = 0; index < originalImages.length; index++) {
      const subImagePath = `${originalImages[index]}`;
      subImages.push(subImagePath);
    }
    // 處理 variant, size, color
    // colorName, colorCode, stock, sizeName 數量會一致
    const originalColors = product.colorName !== null ? product.colorName.split(',') : [];
    const orginalColorCode = product.colorCode !== null ? product.colorCode.split(',') : [];
    const originalSizes = product.sizeName !== null ? product.sizeName.split(',') : [];
    const stocks = product.stock !== null ? product.stock.split(',') : [];
    for (let i = 0; i < originalColors.length; i++) {
      const eachVariant = {
        color_code: orginalColorCode[i],
        size: originalSizes[i],
        stock: stocks[i],
      };
      productVariants.push(eachVariant);
      const colorName = originalColors[i];
      const colorCode = orginalColorCode[i];
      const colorObject = {
        code: colorCode,
        name: colorName,
      };
      colorList.push(colorObject);

      const sizeName = originalSizes[i];
      sizeList.push(sizeName);
    }
    const eachProductResponse = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      texture: product.texture,
      wash: product.wash,
      place: product.place,
      story: product.story,
      main_image: `${product.main_image}`,
      images: subImages,
      colors: Array.from(new Set(colorList.map(JSON.stringify))).map(JSON.parse),
      sizes: Array.from(new Set(sizeList)),
      variants: productVariants,
    };
    responseProducts.push(eachProductResponse);
  });
  return responseProducts;
};
// 拿取全部的商品資料
const queryAllProductsInfo = async (req, page, limit) => {
  let sql = '';
  if (page >= 0) {
    sql = `
      select * from (select product.id, title, description, price, texture, wash, place, note, story, main_image, group_concat(image.image_path) as images from product 
      inner join image 
      on image.product_id=product.id group by product.id) as productDetail
      left join (select GROUP_CONCAT(name) as colorName, GROUP_CONCAT(code) as colorCode, variant.product_id, GROUP_CONCAT(variant.stock) as stock ,GROUP_CONCAT(size_name) as sizeName 
      from variant 
      inner join color on variant.color_id=color.color_id
      inner join size on size.size_id=variant.size_id
      group by variant.product_id) as variantDetail
      on productDetail.id=variantDetail.product_id limit ${limit} offset ${(page) * (limit)};
    `;
  }
  const productsResult = encapsulateProductResponse(req, sql);
  return productsResult;
};
// 暫解，目前沒有更好的想法
const listAllProductsCount = async () => {
  const sql = `
        select count(id) as totalCount from (select id, title, description, price, texture, wash, place, note, story, main_image, GROUP_CONCAT(image_path) as images from 
        (select product.id, title, description, price, texture, wash, place, note, story, main_image, image.image_path from product 
        inner join image 
        on image.product_id=product.id) as tempTable
        GROUP BY tempTable.id) as countTable
    `;
  const resultPromise = exec(sql);
  const totalResult = await resultPromise;
  return totalResult;
};

// 跟上面方法的差異只有必須針對product表中的category作query
const listProductsByCategory = (req, category, page, limit) => {
  let sql = '';
  if (page >= 0) {
    sql = `
      select * from (select product.id, category, keyword, title, description, price, texture, wash, place, note, story, main_image, group_concat(image.image_path) as images from product 
      inner join image 
      on image.product_id=product.id group by product.id) as productDetail
      left join (select GROUP_CONCAT(name) as colorName, GROUP_CONCAT(code) as colorCode, variant.product_id, GROUP_CONCAT(variant.stock) as stock ,GROUP_CONCAT(size_name) as sizeName 
      from variant 
      inner join color on variant.color_id=color.color_id
      inner join size on size.size_id=variant.size_id
      group by variant.product_id) as variantDetail
      on productDetail.id=variantDetail.product_id
      where category='${category}' limit ${limit} offset ${(page) * (limit)};
    `;
  }
  const productsResult = encapsulateProductResponse(req, sql);
  return productsResult;
};

const listProductsByCategoryCount = async (category) => {
  const sql = `
        select count(id) as totalCount from (select id, title, description, price, texture, wash, place, note, story, main_image, GROUP_CONCAT(image_path) as images from 
        (select product.id, title, description, price, texture, wash, place, note, story, main_image, image.image_path from product 
        inner join image 
        on image.product_id=product.id where product.category='${category}') as tempTable
        GROUP BY tempTable.id) as countTable;
    `;
  const resultPromise = exec(sql);
  const totalCount = await resultPromise;
  return totalCount;
};

const listProductsByKeyword = (req, keyword, page, limit) => {
  let sql = '';
  if (page >= 0) {
    sql = `
      select * from (select product.id, category, keyword, title, description, price, texture, wash, place, note, story, main_image, group_concat(image.image_path) as images from product 
      inner join image 
      on image.product_id=product.id group by product.id) as productDetail
      left join (select GROUP_CONCAT(name) as colorName, GROUP_CONCAT(code) as colorCode, variant.product_id, GROUP_CONCAT(variant.stock) as stock ,GROUP_CONCAT(size_name) as sizeName 
      from variant 
      inner join color on variant.color_id=color.color_id
      inner join size on size.size_id=variant.size_id
      group by variant.product_id) as variantDetail
      on productDetail.id=variantDetail.product_id
      where keyword='${keyword}' limit ${limit} offset ${(page) * (limit)};
    `;
  }
  const productsResult = encapsulateProductResponse(req, sql);
  return productsResult;
};

const listProductsByKeywordCount = async (keyword) => {
  const sql = `
        select count(id) as totalCount from (select id, title, description, price, texture, wash, place, note, story, main_image, GROUP_CONCAT(image_path) as images from 
        (select product.id, title, description, price, texture, wash, place, note, story, main_image, image.image_path from product 
        inner join image 
        on image.product_id=product.id where product.keyword='${keyword}') as tempTable
        GROUP BY tempTable.id) as countTable;
    `;
  const resultPromise = exec(sql);
  const totalCount = await resultPromise;
  return totalCount;
};

const listProductByDetailId = async (req, id) => {
  const sql = `
    select * from (select product.id, category, keyword, title, description, price, texture, wash, place, note, story, main_image, group_concat(image.image_path) as images from product 
    inner join image 
    on image.product_id=product.id group by product.id) as productDetail
    left join (select GROUP_CONCAT(name) as colorName, GROUP_CONCAT(code) as colorCode, variant.product_id, GROUP_CONCAT(variant.stock) as stock ,GROUP_CONCAT(size_name) as sizeName 
    from variant 
    inner join color on variant.color_id=color.color_id
    inner join size on size.size_id=variant.size_id
    group by variant.product_id) as variantDetail
    on productDetail.id=variantDetail.product_id
    where id=${id};
    `;
  const productDetails = await encapsulateProductResponse(req, sql);
  return productDetails[0];
};

// 撈出對應的variants
const getVariantForSpecifiedProduct = (id) => {
  const sql = `
        select variant.stock, color.name, color.code, size.size_name from variant 
        inner join color on variant.color_id=color.color_id
        inner join size on size.size_id=variant.size_id
        where variant.product_id=${id}
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

// Cache
// 把 product detail 存到cache
const setProductCacheWithProductId = (id, cacheProduct) => {
  redisClient.setex(`productId${id}`, 3600, cacheProduct, redis.print);
};

// 從 cache 拿取 productDetail
const getProductDetailWithId = (id) => {
  const productDetailPromise = new Promise((resolve, reject) => {
    redisClient.get(`productId${id}`, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
  return productDetailPromise;
};

module.exports = {
  listAllProductsCount,
  listProductsByCategory,
  listProductsByCategoryCount,
  listProductsByKeyword,
  listProductsByKeywordCount,
  listProductByDetailId,
  getVariantForSpecifiedProduct,
  setProductCacheWithProductId,
  getProductDetailWithId,
  queryAllProductsInfo,
};
