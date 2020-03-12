const validOrderIdStr = (window.location.search).replace('?id=', '');
const orderId = parseInt(validOrderIdStr);

const h2Element = document.querySelector('h2');
h2Element.textContent = `訂單編號: ${orderId}`;
