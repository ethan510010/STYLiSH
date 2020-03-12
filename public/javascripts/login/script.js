// FB登入的部分
const fbLoginBtn = document.getElementById('facebook_login');
fbLoginBtn.addEventListener('click', (e) => {
  facebookLogin();
});

function facebookLogin() {
  FB.getLoginStatus((response) => {
    console.log(response);
    statusChangeCallback(response);
  });
}

function statusChangeCallback(response) {
  if (response.status === 'connected') {
    // user登入了
    fbLoginBtn.value = 'Fb logout';
    const { accessToken } = response.authResponse;
    fetchUSerInfo(accessToken);
  } else {
    FB.login((response) => {
      const { accessToken } = response.authResponse;
      // 拿到accessToken，提供給後端

      console.log(accessToken);
      statusChangeCallback(response);
    }, { scope: 'public_profile,email' });
  }
}

function fetchUSerInfo(accessToken) {
  //  改成用Ajax打我們自己的server
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const responseJSON = JSON.parse(xhr.responseText);
      const user_fb_info_div = document.querySelector('.user_fb_info');
      user_fb_info_div.innerHTML = `<p>FB用戶名: ${responseJSON.data.user.name}, FB信箱: ${responseJSON.data.user.email}</p>`;
    }
  };
  xhr.open('POST', '/api/v1/user/signin', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  const requestBody = JSON.stringify({
    provider: 'facebook',
    access_token: accessToken,
  });
  console.log('Request body參數', requestBody);
  xhr.send(requestBody);
}

// 一般登入的部分
const generalLoginButton = document.querySelector('.normal_login');
generalLoginButton.addEventListener('click', (e) => {
  const emailValue = document.querySelector('.user_email').value;
  const passwordValue = document.querySelector('.user_password').value;
  const requestBody = JSON.stringify({
    provider: 'native',
    email: emailValue,
    password: passwordValue,
  });
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const responseJSON = JSON.parse(xhr.responseText);
      const generalUserInfoDiv = document.querySelector('.general_login_info');
      generalUserInfoDiv.innerHTML = `<p>name=${responseJSON.data.user.name}, picture=${responseJSON.data.user.picture}</p>`;
    }
  };
  xhr.open('POST', '/api/v1/user/signin', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(requestBody);
});
