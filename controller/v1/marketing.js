const {
  listAllCampaigns,
  setMarketingCampaignsCache,
} = require('../../Model/v1/marketing');
const { generateImagePrefix } = require('../../common/common');


const queryAllCampaigns = async (req, res) => {
  try {
    const imagePrefix = generateImagePrefix(req);
    console.log(imagePrefix);
    const allCampaigns = await listAllCampaigns();
    const responseJSON = [];
    allCampaigns.forEach((campaign) => {
      const eachCampaign = {
        product_id: campaign.product_id,
        picture: `${imagePrefix}/${campaign.picture}`,
        story: campaign.story,
      };
      responseJSON.push(eachCampaign);
    });
    // 這邊可以讓存 cache 是 async 的，因為就算存cache失敗也沒關係，就再打 api，所以不會把 res.json 包在存 cache 裡面
    setMarketingCampaignsCache(JSON.stringify(responseJSON));
    res.json({
      data: responseJSON,
    });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  queryAllCampaigns,
};
