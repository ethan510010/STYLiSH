let nowPage = 0;
let getAPINextPage = 0;

const getProductsInfo = (page) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const responseJSON = JSON.parse(xhr.responseText);
      if (responseJSON.next_paging !== undefined) {
        getAPINextPage = responseJSON.next_paging;
      }
      const productsList = responseJSON.data;
      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < productsList.length; index++) {
        // 建立商品div
        const divElementForProduct = document.createElement('div');
        divElementForProduct.classList.add('product');
        // 產生a連結
        const aTag = document.createElement('a');
        aTag.href = `/product.html?id=${productsList[index].id}`;
        // 加入圖片
        const productImageElement = document.createElement('img');
        const productMainImage = productsList[index].main_image;
        productImageElement.src = productMainImage;
        // 顏色框框
        const productColorBoxDiv = document.createElement('div');
        productColorBoxDiv.classList.add('color_box');
        const eachProductColors = productsList[index].colors;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < eachProductColors.length; i++) {
          const innerColorBox = document.createElement('div');
          innerColorBox.classList.add('small_color_box');
          innerColorBox.style.backgroundColor = `#${eachProductColors[i].code}`;
          productColorBoxDiv.appendChild(innerColorBox);
        }
        // 商品標題
        const productTitle = productsList[index].title;
        const productTitleElement = document.createElement('p');
        productTitleElement.textContent = productTitle;
        // 商品價格
        const productPrice = productsList[index].price;
        const productPriceElement = document.createElement('p');
        productPriceElement.textContent = `TWD.${productPrice}`;
        divElementForProduct.appendChild(aTag);
        aTag.appendChild(productImageElement);
        aTag.appendChild(productColorBoxDiv);
        aTag.appendChild(productTitleElement);
        aTag.appendChild(productPriceElement);
        // 加入到content
        const contentElement = document.querySelector('.content');
        contentElement.appendChild(divElementForProduct);
      }
    }
  };
  // 先只做一頁試試
  if (getAPINextPage > 0 || nowPage === 0) {
    xhr.open('GET', `/api/v1/products/all?paging=${page}`, true);
    xhr.send(null);
  }
};

getProductsInfo(nowPage);

// 取得滾動到底部
function getScrollTop() {
  let scrollTop = 0;
  let bodyScrollTop = 0;
  let documentScrollTop = 0;
  if (document.body) {
    bodyScrollTop = document.body.scrollTop;
  }
  if (document.documentElement) {
    documentScrollTop = document.documentElement.scrollTop;
  }
  scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
  return scrollTop;
}

function getScrollHeight() {
  let scrollHeight = 0;
  let bodyScrollHeight = 0;
  let documentScrollHeight = 0;
  if (document.body) {
    bodyScrollHeight = document.body.scrollHeight;
  }
  if (document.documentElement) {
    documentScrollHeight = document.documentElement.scrollHeight;
  }
  scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
  return scrollHeight;
}

function getWindowHeight() {
  let windowHeight = 0;
  if (document.compatMode === 'CSS1Compat') {
    windowHeight = document.documentElement.clientHeight;
  } else {
    windowHeight = document.body.clientHeight;
  }
  return windowHeight;
}

// 捲動到最底部要能去加載api
window.onscroll = () => {
  if (getScrollTop() + getWindowHeight() === getScrollHeight()) {
    nowPage += 1;
    getProductsInfo(nowPage);
  }
};


// User profile點擊
const userProfileElement = document.querySelector('.user_profile');
userProfileElement.addEventListener('click', () => {
  window.location = '/profile.html';
});
