const { exec, escape, execTransactionOrderAndOrderDetail } = require('../../db/mysql');

// 存入訂單資訊
const insertOrderInfo = (
  userToken,
  shipping,
  payment,
  subtotal,
  freight,
  total,
  recipientName,
  recipientPhone,
  recipientEmail,
  recipientAddress,
  recipientTime,
  listCount,
  productIdList,
  nameList,
  colorCodeList,
  colorNameList,
  sizeList,
  qtyList,
) => {
  const insertOrderSQL = `
        insert into user_order SET
        user_token='${userToken}',
        shipping='${shipping}',
        payment='${payment}',
        subtotal=${subtotal},
        freight=${freight},
        total=${total},
        recipient_name='${recipientName}',
        recipient_phone='${recipientPhone}',
        recipient_email='${recipientEmail}',
        recipient_address='${recipientAddress}',
        recipient_time='${recipientTime}'
    `;
  const insertOrderDetailSQLCMDList = [];
  for (let index = 0; index < listCount; index++) {
    const productId = productIdList[index];
    const productName = nameList[index];
    const colorCode = colorCodeList[index];
    const colorName = colorNameList[index];
    const size = sizeList[index];
    const qty = qtyList[index];

    const insertOrderListDetail = `
            insert into order_list_detail SET
            product_id=${productId},
            name='${productName}',
            color_code='${colorCode}',
            color_name='${colorName}',
            size='${size}',
            qty=${qty},
            order_id=?
        `;
    insertOrderDetailSQLCMDList.push(insertOrderListDetail);
  }

  const resultPromise = execTransactionOrderAndOrderDetail(insertOrderSQL, insertOrderDetailSQLCMDList);
  return resultPromise;
};

// 存入付款資訊
const insertPaymentInfo = (orderId, paymentInfo) => {
  const sql = `
        insert into payment_info SET
        order_id=${orderId},
        status=${paymentInfo.status},
        amount=${paymentInfo.amount},
        currency='${paymentInfo.currency}',
        card_last_four='${paymentInfo.card_last_four}'
    `;
  const resultPromise = exec(sql);
  return resultPromise;
};

module.exports = {
  insertOrderInfo,
  insertPaymentInfo,
};
