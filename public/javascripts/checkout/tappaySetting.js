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

// Get prime & send request to our own backend
const getPrimeBtn = document.getElementById('get_prime');
getPrimeBtn.addEventListener('click', (e) => {
  TPDirect.card.getPrime((result) => {
    console.log('前端拿到prime的結果', result);
    if (result.status !== 0) {
      alert('取得prime有問題');
      return;
    }
    const primeResult = result.card.prime;
    // 拿到prime之後，打我們自己的後端api
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        const resultElement = document.getElementById('tappay_response');
        resultElement.textContent = `orderNumber: ${response.data.number}`;
      }
    };
    // 前端送到後端的requestBody
    const requestBody = JSON.stringify({
      prime: primeResult,
      order: {
        shipping: 'delivery',
        payment: 'credit_card',
        subtotal: 1234,
        freight: 14,
        total: 1300,
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
          id: 1,
          name: '活力花紋長筒牛仔褲',
          price: 1299,
          color: {
            code: 'DDF0FF',
            name: '淺藍',
          },
          size: 'M',
          qty: 1,
        },
      ],
    });
    xhr.open('POST', '/api/v1/order/checkout', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(requestBody);
  });
});
