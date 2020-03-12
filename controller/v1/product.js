const {
  listAllProductsCount,
  listProductsByCategory,
  listProductsByCategoryCount,
  listProductsByKeyword,
  listProductsByKeywordCount,
  listProductByDetailId,
  setProductCacheWithProductId,
  queryAllProductsInfo,
} = require('../../Model/v1/product');

const queryAllProducts = async (req, res) => {
  try {
    const { endPoint } = req.params;
    const pageStr = req.query.paging;
    let page = 0;
    if (!pageStr) {
      page = 0;
    } else if (parseInt(pageStr, 10) >= 0) {
      page = parseInt(pageStr, 10);
    } else {
      res.status(400);
      res.send('paging參數輸入錯誤');
      return;
    }
    const searchKeyword = req.query.keyword;
    const detailId = parseInt(req.query.id, 10);
    // limit是這邊自定好一次給幾筆
    const limit = 6;
    // 取得現在全部商品數量
    let totalProductCount = 0;
    let productsRes = [];
    switch (endPoint) {
      case 'men':
      case 'women':
      case 'accessories':
        totalProductCount = await listProductsByCategoryCount(endPoint);
        productsRes = await listProductsByCategory(req, endPoint, page, limit);
        break;
      case 'all':
        totalProductCount = await listAllProductsCount();
        productsRes = await queryAllProductsInfo(req, page, limit);
        break;
      case 'search':
        totalProductCount = await listProductsByKeywordCount(searchKeyword);
        productsRes = await listProductsByKeyword(req, searchKeyword, page, limit);
        break;
      case 'details':
        // 用id的只會有一筆資料，所以獨立出來處理
        if (!detailId) {
          res.status(400).send('id格式錯誤');
          return;
        }
        // 下面由 Model 處理只會有 1 筆
        productsRes = await listProductByDetailId(req, detailId);
        // 針對details的id的處理
        if (detailId && productsRes) {
          // 存到cache
          setProductCacheWithProductId(productsRes.id, JSON.stringify(productsRes));
          res.json({
            data: productsRes,
          });
          return;
        }
        res.send('該商品id不存在');
        return;
      default:
        console.log('沒有在現有path中');
        break;
    }

    // 紀錄paging
    const nextPaging = page + 1;
    if ((nextPaging * limit >= totalProductCount)) {
      res.json({
        data: productsRes,
      });
    } else {
      res.json({
        data: productsRes,
        next_paging: nextPaging,
      });
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  queryAllProducts,
};
