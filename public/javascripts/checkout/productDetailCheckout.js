/* eslint-disable no-useless-return */
// set UI
TPDirect.card.setup({
  fields: {
    number: {
      // css selector
      element: '#card-number',
      placeholder: '**** **** **** ****',
    },
    expirationDate: {
      // DOM object
      element: document.getElementById('card-expiration-date'),
      placeholder: 'MM / YY',
    },
    ccv: {
      element: '#card-ccv',
      placeholder: 'ccv',
    },
  },
  styles: {
    // Style all elements
    input: {
      color: 'gray',
    },
    // Styling ccv field
    'input.cvc': {
      // 'font-size': '16px'
    },
    // Styling expiration-date field
    'input.expiration-date': {
      // 'font-size': '16px'
    },
    // Styling card-number field
    'input.card-number': {
      // 'font-size': '16px'
    },
    // style focus state
    ':focus': {
      // 'color': 'black'
    },
    // style valid state
    '.valid': {
      color: 'green',
    },
    // style invalid state
    '.invalid': {
      color: 'red',
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 400px)': {
      input: {
        color: 'orange',
      },
    },
  },
});

// Get Prime並觸發我們自己的checkout api
const payButton = document.getElementById('pay');
payButton.addEventListener('click', (event) => {
  // Get Prime
  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
      return;
    }
    const primeResult = result.card.prime;
    const productTitle = document.querySelector('.right_info_part .title').textContent;
    const productIdStr = document.querySelector('.right_info_part .product_id').textContent;
    const priceStr = document.querySelector('.right_info_part .product_price').textContent;
    const realPriceStr = priceStr.replace('TWD.', '');
    const requestBody = JSON.stringify({
      prime: primeResult,
      order: {
        shipping: 'delivery',
        payment: 'credit_card',
        subtotal: 1234,
        freight: 14,
        total: parseInt(realPriceStr),
        recipient: {
          name: 'Luke',
          phone: '0987654321',
          email: 'luke@gmail.com',
          address: '市政府站',
          time: 'morning',
        },
      },
      list: [
        {
          id: parseInt(productIdStr),
          name: productTitle,
          price: parseInt(realPriceStr),
          color: {
            code: 'DDF0FF',
            name: '淺藍',
          },
          size: 'M',
          qty: 1,
        },
      ],
    });
    fetch('/api/v1/order/checkout', {
      method: 'POST',
      body: requestBody,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    })
      .then((response) => response.json())
      .catch((error) => {
        if (error) {
          window.location = '/paymentResult/paymentError.html';
        }
      })
      .then((response) => {
        const orderNumber = response.data.number;
        window.location = `/paymentResult/thankyou.html?id=${orderNumber}`;
      });
  });
});

// 導頁到User profile
const userProfileElement = document.querySelector('.user_profile');
userProfileElement.addEventListener('click', () => {
  window.location = '/profile.html';
});
