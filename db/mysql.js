const mysql = require('mysql');
const { mySQLConfig } = require('../config/db');

// const connection = mysql.createConnection(mySQLConfig);
const pool = mysql.createPool(mySQLConfig);

// 執行sql的語法
function exec(sql) {
  const promise = new Promise((resolve, reject) => {
    pool.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
  return promise;
}

// 執行有一個參數的sql語法
function execWithParam(sql, para) {
  const promise = new Promise((resolve, reject) => {
    pool.query(sql, para, (err, result) => {
      if (err) {
        console.log('出現錯誤');
        reject(err);
        return;
      }
      resolve(result);
    });
  });
  return promise;
}

// 執行有兩個參數的sql語法
function execSQLWithTwoParameters(sql, para1, para2) {
  console.log(sql, para1, para2);
  const promise = new Promise((resolve, reject) => {
    pool.query(sql, [para1, para2], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
  return promise;
}

// 這邊還不知道怎麼寫比較好，先拆開來用
// 插入商品及subimage
function execProductAdnImageTransaction(insertProductSQL, imageSQLCMDList) {
  const transactionPromise = new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      connection.beginTransaction(async (error) => {
        if (error) {
          return connection.rollback(() => {
            connection.release();
            reject(error);
          });
        }
        connection.query(insertProductSQL, (insertProductErr, result) => {
          if (insertProductErr) {
            return connection.rollback(() => {
              connection.release();
              reject(insertProductErr);
            });
          }
          const { insertId } = result;
          const subImageQueryResult = [];
          for (let index = 0; index < imageSQLCMDList.length; index++) {
            const eachInsertImageSQL = imageSQLCMDList[index];
            // eslint-disable-next-line no-loop-func
            connection.query(eachInsertImageSQL, insertId, (eachQueryErr, eachSubImageQueryResult) => {
              if (eachQueryErr) {
                return connection.rollback(() => {
                  connection.release();
                  reject(eachQueryErr);
                });
              }
              subImageQueryResult.push(eachSubImageQueryResult);
            });
          }
          // 全部的subImage都insert成功才commit
          connection.commit((commitError) => {
            if (commitError) {
              return connection.rollback(() => {
                connection.release();
                reject(commitError);
              });
            }
            resolve(subImageQueryResult);
            connection.release();
            console.log('commit商品完成，並且釋放掉connection');
          });
        });
      });
    });
  });
  return transactionPromise;
}

// 插入顏色、size、及variant (還沒改成pool)
function execTransactionForColorAndSizeAndVariant(insertColorSQL,
  insertSizeSQL,
  insertVariantSQL,
  existedColorId,
  existedSizeId) {
  const transactionPromise = new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      connection.beginTransaction(async (beginTransactionErr) => {
        if (beginTransactionErr) {
          return connection.rollback(() => {
            connection.release();
            reject(beginTransactionErr);
          });
        }
        // const insertColorResult = {};
        let colorId = existedColorId;
        let sizeId = existedSizeId;
        if (insertColorSQL !== '') {
          connection.query(insertColorSQL, (insertColorErr, insertColorResult) => {
            if (insertColorErr) {
              return connection.rollback(() => {
                connection.release();
                reject(insertColorErr);
              });
            }
            colorId = insertColorResult.insertId;
            connection.query(insertSizeSQL, (insertSizeErr, insertSizeResult) => {
              if (insertSizeErr) {
                return connection.rollback(() => {
                  connection.release();
                  reject(insertSizeErr);
                });
              }
              sizeId = insertSizeResult.insertId;
              connection.query(insertVariantSQL, [colorId, sizeId], (insertVariantErr, insertVariantResult) => {
                if (insertVariantErr) {
                  return connection.rollback(() => {
                    connection.release();
                    reject(insertVariantErr);
                  });
                }
                connection.commit((commitError) => {
                  if (commitError) {
                    return connection.rollback(() => {
                      connection.release();
                      reject(commitError);
                    });
                  }
                  resolve(insertVariantResult);
                  connection.release();
                  console.log('成功寫入顏色、尺寸，並且釋放connection');
                });
              });
            });
          });
        }
      });
    });
  });
  return transactionPromise;
}

// 插入User及對應的native user info及fb info
function execTransactionForUserAndNativeUserInfoOrFBUserInfo(insertUserSQL, insertNativeInfoOrFBInfoSQL) {
  const promise = new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        connection.release();
        reject(err);
      }
      connection.beginTransaction(async (beginTransactionError) => {
        if (beginTransactionError) {
          return connection.rollback(() => {
            connection.release();
            reject(beginTransactionError);
          });
        }
        connection.query(insertUserSQL, (insertUserErr, result) => {
          if (insertUserErr) {
            return connection.rollback(() => {
              connection.release();
              reject(insertUserErr);
            });
          }
          const userId = result.insertId;
          connection.query(insertNativeInfoOrFBInfoSQL, userId, (
            insertNativeOrFBInfoErr,
            userDetailInfo) => {
            if (insertNativeOrFBInfoErr) {
              connection.release();
              reject(insertNativeOrFBInfoErr);
              return;
            }
            connection.commit((commitError) => {
              if (commitError) {
                return connection.rollback(() => {
                  connection.release();
                  reject(commitError);
                });
              }
              console.log('存用戶資料');
              resolve(userDetailInfo);
              connection.release();
              console.log('成功寫入使用者資料，並且釋放connection');
            });
          });
        });
      });
    });
  });
  return promise;
}

function execMultipleParasSQL(sql, ...params) {
  const promise = new Promise((resolve, reject) => {
    pool.query(sql, ...params, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
  return promise;
}

// 處理訂單資訊
function execTransactionOrderAndOrderDetail(insertOrderSQL, insertOrderListDetailCMDList) {
  const promise = new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      connection.beginTransaction((beginTransactionErr) => {
        if (beginTransactionErr) {
          return connection.rollback(() => {
            connection.release();
            reject(beginTransactionErr);
          });
        }
        connection.query(insertOrderSQL, (insertOrderErr, insertOrderResult) => {
          if (insertOrderErr) {
            return connection.rollback(() => {
              connection.release();
              reject(insertOrderErr);
            });
          }
          const insertOrderId = insertOrderResult.insertId;
          const insertListForEachOrderResult = [];
          for (let index = 0; index < insertOrderListDetailCMDList.length; index++) {
            const insertOrderDetailSQL = insertOrderListDetailCMDList[index];
            connection.query(insertOrderDetailSQL, insertOrderId, (insertOrderDetailErr, insertOrderDetailResult) => {
              if (insertOrderDetailErr) {
                return connection.rollback(() => {
                  connection.release();
                  reject(insertOrderDetailErr);
                });
              }
              insertListForEachOrderResult.push(insertOrderDetailResult);
            });
          }
          connection.commit((commitError) => {
            if (commitError) {
              return connection.rollback(() => {
                connection.release();
                reject(commitError);
              });
            }
            const responseResult = {
              insertListForEachOrderResult,
              orderId: insertOrderId,
            };
            resolve(responseResult);
            connection.release();
            console.log('成功寫入訂單資料，並且釋放connection');
          });
        });
      });
    });
  });
  return promise;
}

// encapsulate transaction
// const transactions = (transaction) => {
//   return new Promise((resolve, reject) => {
//     pool.getConnection((err, connection) => {
//       if (err) {
//         reject(err);
//       } else {
//         connection.beginTransaction((err) => {
//           if (err) {
//             connection.release();
//             reject(err);
//           } else {
//             const promise = transaction(connection);
//             promise.then((result) => {
//               connection.commit((err) => {
//                 if (err) {
//                   reject(err);
//                 } else {
//                   resolve(result);
//                 }
//                 connection.release();
//               }).catch((err) => {
//                 connection.rollback(() => {
//                   connection.release();
//                   reject(err);
//                 });
//               });
//             });
//           }
//         });
//       }
//     });
//   });
// };
module.exports = {
  execProductAdnImageTransaction,
  execTransactionForColorAndSizeAndVariant,
  exec,
  escape: mysql.escape,
  execTransactionForUserAndNativeUserInfoOrFBUserInfo,
  execTransactionOrderAndOrderDetail,
};
