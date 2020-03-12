let isOpen = true;
const searchAllProductsBtn = document.getElementById('search_all_products_id');
searchAllProductsBtn.addEventListener('click', (e) => {
  isOpen = !isOpen;
  const listProductsIdUL = document.querySelector('.compaign-use-search-products-id');
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const responseJSON = JSON.parse(xhr.responseText);
      if (!isOpen) {
        for (let i = 0; i < responseJSON.length; i++) {
          const eachProduct = responseJSON[i];
          const liElement = document.createElement('li');
          liElement.textContent = `商品編號: ${eachProduct.id}, 商品標題${eachProduct.title}`;
          listProductsIdUL.appendChild(liElement);
        }
      } else {
        listProductsIdUL.innerHTML = '';
      }
    }
  };
  xhr.open('GET', '/search/productId');
  xhr.send(null);
});
