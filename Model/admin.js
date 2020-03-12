const {
  execProductAdnImageTransaction, execTransactionForColorAndSizeAndVariant, exec, escape,
} = require('../db/mysql');

const addProductInfo = async (productModel) => {
  console.log(productModel);
  const validMainImageUrl = escape(productModel.mainImageUrl);
  const insertProductSQLCMD = `
        insert into product 
        (title, description, price, texture, wash, place, note, story, main_image, category, keyword)
        values
        ('${productModel.title}', '${productModel.description}', 
        ${productModel.price}, '${productModel.texture}',
        '${productModel.wash}', '${productModel.place}',
        '${productModel.note}', '${productModel.story}',
        ${validMainImageUrl}, '${productModel.category}', '${productModel.keyword}')
    `;

  const insertImageSQLCMDList = [];

  for (let i = 0; i < productModel.subImageUrlList.length; i++) {
    const eachImagePath = escape(productModel.subImageUrlList[i]);
    const eachInsertImageSQL = `
            INSERT INTO image
            SET
            image_path=${eachImagePath}, product_id=?
        `;
    insertImageSQLCMDList.push(eachInsertImageSQL);
  }
  console.log(insertImageSQLCMDList);
  const transactionPromise = execProductAdnImageTransaction(insertProductSQLCMD, 
    insertImageSQLCMDList);

  return transactionPromise;
};

const addVariantForProduct = async (productId, colorCode, colorName, size, stock) => {
  // 確認是否有重複的顏色
  const confirmRepeatedColor = `
    select * from color where code = '${colorCode}' and name = '${colorName}';
  `;
  const checkRepeatColorResult = await exec(confirmRepeatedColor);
  let insertColorSQL = '';
  // 已經存在重複的 color
  let existedColorId = 0;
  if (checkRepeatColorResult.length > 0) {
    existedColorId = checkRepeatColorResult[0].color_id;
  } else {
    insertColorSQL = `
      insert into color (code, name)
      values 
      ('${colorCode}', '${colorName}')
    `;
  }

  // 確認是否有重複的 size
  const confirmRepeatedSize = `
    select * from size where size_name='${size}'
  `;
  const checkRepeatedSizeResult = await exec(confirmRepeatedSize);
  let insertSizeSQL = '';
  // 已經存在重複的 size
  let existedSizeId = 0;
  if (checkRepeatedSizeResult.length > 0) {
    existedSizeId = checkRepeatedSizeResult[0].size_id;
  } else {
    insertSizeSQL = `
      insert into size (size_name)
      values
      ('${size}')
    `;
  }
  const insertVariantSQL = `
        insert into variant 
        SET
        product_id=${productId}, stock=${stock},
        color_id=?, size_id=?
    `;

  const resultPromise = execTransactionForColorAndSizeAndVariant(insertColorSQL,
    insertSizeSQL,
    insertVariantSQL,
    existedColorId,
    existedSizeId);
  return resultPromise;
};

// 新增廣告活動
const addCampaignInfo = (productId, picture, story) => {
  const sql = `
        insert into campaign (product_id, picture, story)
        values
        (${productId}, '${picture}', '${story}')
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

// 撈取全部product的id
const allProductsId = () => {
  const sql = `
        select id from product
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

// 撈取campaign table中所有的product id
const allCampaignProductsId = () => {
  const sql = `
        select product_id as productId from campaign;
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

module.exports = {
  addProductInfo,
  addVariantForProduct,
  addCampaignInfo,
  allProductsId,
  allCampaignProductsId,
};
