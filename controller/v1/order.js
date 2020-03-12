const rp = require('request-promise');
const { insertOrderInfo, insertPaymentInfo } = require('../../Model/v1/order');

const recordOrderInfo = async (req, res) => {
  const { prime } = req.body;
  // 通常這邊要去比對product DB裡面的資料，確定使用者沒有亂改價錢 (這邊先跳過) (如果要的話我們就必須利用list裡面的商品id跟我們product DB去做比對了)

  // 存前端送過來的訂單資訊
  const totalAmount = parseInt(req.body.order.total, 10);
  // 這邊要去打tappay的api (利用request-promise)

  let accessToken = '';
  if (req.headers.authorization) {
    accessToken = req.headers.authorization.replace('Bearer ', '');
  }
  const {
    shipping, payment, subtotal, freight, total 
  } = req.body.order;
  const recipientUserName = req.body.order.recipient.name;
  const recipientUserPhone = req.body.order.recipient.phone;
  const recipientUserEmail = req.body.order.recipient.email;
  const recipientUserAddress = req.body.order.recipient.address;
  const recipientUserTime = req.body.order.recipient.time;

  // list的數目及相關處理
  const listCount = req.body.list.length;

  const productIdList = [];
  const nameList = [];
  const colorCodeList = [];
  const colorNameList = [];
  const sizeList = [];
  const qtyList = [];
  req.body.list.forEach((productDetail) => {
    productIdList.push(productDetail.id);
    nameList.push(productDetail.name);
    colorCodeList.push(productDetail.color.code);
    colorNameList.push(productDetail.color.name);
    sizeList.push(productDetail.size);
    qtyList.push(productDetail.qty);
  });

  try {
    const insertOrderInfoResultObj = await insertOrderInfo(
      accessToken,
      shipping,
      payment,
      subtotal,
      freight,
      total,
      recipientUserName,
      recipientUserPhone,
      recipientUserEmail,
      recipientUserAddress,
      recipientUserTime,
      listCount,
      productIdList,
      nameList,
      colorCodeList,
      colorNameList,
      sizeList,
      qtyList,
    );
    console.log('插入的訂單資訊', insertOrderInfoResultObj);
    const { orderId } = insertOrderInfoResultObj;
    const requestBodyForTappayServer = {
      prime,
      partner_key: 'partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG',
      merchant_id: 'AppWorksSchool_CTBC',
      amount: totalAmount,
      details: 'Tappay Test',
      cardholder: {
        phone_number: recipientUserPhone,
        name: recipientUserName,
        email: recipientUserEmail,
      },
    };
    // 下面是要看request-promise的文件
    const options = {
      method: 'POST',
      uri: 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG',
      },
      body: requestBodyForTappayServer,
      json: true,
    };

    try {
      const tappayResponse = await rp(options);
      const insertPaymentResult = await insertPaymentInfo(orderId, {
        status: tappayResponse.status,
        amount: tappayResponse.amount,
        currency: tappayResponse.currency,
        card_last_four: tappayResponse.card_info.last_four,
      });
      if (insertPaymentResult.affectedRows > 0) {
        res.json({
          data: {
            number: orderId,
          },
        });
      }
      // 回來的response要存到付款資訊的table
    } catch (error) {
      console.log(error);
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = {
  recordOrderInfo,
};
