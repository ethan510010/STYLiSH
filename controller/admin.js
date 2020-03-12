const path = require('path');
const fs = require('fs');
const {
  addProductInfo,
  addVariantForProduct,
  addCampaignInfo,
  allProductsId,
  allCampaignProductsId,
} = require('../Model/admin');
const { clearMarketingCampaignsCache } = require('../Model/v1/marketing');
const { ProductModel } = require('../responseModel/product');
// 新增商品
const addNewProduct = async (req, res) => {
  const title = req.body.product_title;
  const description = req.body.product_description;
  const price = req.body.product_price;
  const texture = req.body.product_texture;
  const wash = req.body.product_wash;
  const place = req.body.product_place;
  const note = req.body.product_note;
  const story = req.body.product_story;
  const mainImageUrl = `https://practicestylish.s3.us-east-2.amazonaws.com/${req.files.product_main_image[0].key}`;
  const subfiles = req.files.product_sub_images;
  const subImageUrlList = [];
  for (let index = 0; index < subfiles.length; index++) {
    const eachSubFilePath = `https://practicestylish.s3.us-east-2.amazonaws.com/${subfiles[index].key}`;
    subImageUrlList.push(eachSubFilePath);
  }
  // 因為到時DB存的是TEXT，所以下面把array轉成string
  // const subImageUrlListStr = JSON.stringify(subImageUrlList);
  // 沒有要上傳活動檔次，而且這邊的設計目前是有問題的
  // const hotId = req.body.hot_id;
  const category = req.body.product_category;
  const keyword = req.body.product_keyword;

  const newProductDataModel = new ProductModel(
    title,
    description,
    price,
    texture,
    wash,
    place,
    note,
    story,
    mainImageUrl,
    subImageUrlList,
    category,
    keyword,
  );

  // 寫入到DB
  try {
    const addProductsResult = await addProductInfo(newProductDataModel);
    if (addProductsResult.length > 0) {
      res.send('商品資料上傳成功');
    }
  } catch (error) {
    res.send('請確認新增的商品熱銷活動編號正確以及該活動存在');
  }
};

const uploadVariantForProduct = async (req, res) => {
  const { product_id: productId } = req.body;
  const colorCode = req.body.regular_color_code;
  const colorName = req.body.regular_color_name;
  const size = req.body.regular_size;
  const stock = req.body.regular_stock;

  // 寫入規格到DB
  try {
    const addVariantResult = await addVariantForProduct(productId,
      colorCode,
      colorName,
      size,
      stock);
    if (addVariantResult.affectedRows > 0) {
      res.send('新增規格成功');
    }
  } catch (error) {
    res.send('請確認新增的商品編號是存在的');
  }
};

const uploadCampaign = async (req, res) => {
  const productId = parseInt(req.body.product_id, 10) || 0;
  const picturePath = req.files.campaign_picture[0].path;
  const { story } = req.body;
  const allProductsIdResult = await allProductsId();
  const productIdList = [];
  allProductsIdResult.forEach((productIdObj) => {
    productIdList.push(productIdObj.id);
  });

  if (!productIdList.includes(productId)) {
    // 雖然不會插入到資料庫中，但還是會因為multer而存到資料夾，所以要刪除
    // 因為移到 s3 上面去了，所以下面可以助解掉
    // const rootPath = path.join(__dirname, '../');
    // const imagePath = path.join(rootPath, `${picturePath}`);
    // fs.unlink(imagePath, (err) => {
    //   if (err) {
    //     console.log('刪除失敗');
    //   } else {
    //     console.log('刪除成功');
    //   }
    // });
    res.send('請確認新增的商品編號是存在的');
    return;
  }

  try {
    const allCampaignProductsIdList = await allCampaignProductsId();
    const campaignProductsIdList = [];
    allCampaignProductsIdList.forEach((campaign) => {
      campaignProductsIdList.push(campaign.productId);
    });
    const addCampaingResult = await addCampaignInfo(productId, picturePath, story);
    if (addCampaingResult.affectedRows > 0) {
      // 因為有新增成功，所以對應的 redis cache要移除
      clearMarketingCampaignsCache();
      res.send('新增活動成功');
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addNewProduct,
  uploadVariantForProduct,
  uploadCampaign,
};
