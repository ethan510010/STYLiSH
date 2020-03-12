// let searchHotIdBtn = document.querySelector(".search_hot_id")
// searchHotIdBtn.addEventListener("click", function(e) {
//     let searchHotDiv = document.getElementById("search_hot_activity");
//     ajaxAndInsertHTMLInfo(searchHotDiv, "熱銷活動編號", "熱銷活動名稱", "/search/hotActivity")
// });

// let searchProductIdBtnForColor = document.querySelector(".search_product_id_by_color")
// searchProductIdBtnForColor.addEventListener("click", function(e) {
//     let searchProductDiv = document.getElementById("search_product_by_color")
//     ajaxAndInsertHTMLInfo(searchProductDiv, "商品編號", "商品名稱", "/search/productId")
// })

const searchProductIdBtnForVariant = document.querySelector('.search_product_id_by_variant');
searchProductIdBtnForVariant.addEventListener('click', (e) => {
  const searchProductDivInVariant = document.getElementById('search_product_by_variant');
  ajaxAndInsertHTMLInfo(searchProductDivInVariant, '商品編號', '商品名稱', '/search/productId');
});


function ajaxAndInsertHTMLInfo(element, idTitle, infoName, url) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const responseJSON = JSON.parse(xhr.responseText);
      let innerHTMLStr = '';
      for (let index = 0; index < responseJSON.length; index++) {
        const eachActivity = responseJSON[index];
        innerHTMLStr += `<p>${idTitle}: ${eachActivity.id}, ${infoName}: ${eachActivity.title}</p>`;
      }
      element.innerHTML = innerHTMLStr;
    }
  };
  xhr.open('GET', url);
  xhr.send(null);
}
