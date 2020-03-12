// FB登入
const fbButton = document.querySelector('.FB_login #facebook_login');

fbButton.addEventListener('click', () => {
  FB.getLoginStatus((response) => {
    statusChangeCallback(response);
  });
});

function statusChangeCallback(response) {
  if (response.status === 'connected') {
    // user登入了
    const { accessToken } = response.authResponse;
    fetchUSerInfo(accessToken);
  } else {
    FB.login((fbResponse) => {
      const { accessToken } = fbResponse.authResponse;
      // 拿到accessToken，提供給後端
      statusChangeCallback(fbResponse);
    }, { scope: 'public_profile,email' });
  }
}

function fetchUSerInfo(accessToken) {
  // 打我們自己的api
  fetch('/api/v1/user/signin', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'facebook',
      access_token: accessToken,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })
    .then((response) => response.json())
    .catch((error) => console.log(error))
    .then((info) => {
      // 前端設定cookie
      document.cookie = `access_token=${info.data.access_token}`;
      window.location = '/profile.html';
    });
}

// 一般登入
const generalLoginBtn = document.querySelector('.general_login .normal_login');
generalLoginBtn.addEventListener('click', () => {
  const email = document.querySelector('.general_login .user_email').value;
  const password = document.querySelector('.general_login .user_password').value;
  fetch('/api/v1/user/signin', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'native',
      email,
      password,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })
    .then((response) => response.json())
    .catch((error) => console.log(error))
    .then((info) => {
      document.cookie = `access_token=${info.data.access_token}`;
      window.location = '/profile.html';
    });
});

// 用戶註冊
const signupBtn = document.querySelector('.user_signup .sign_up');
signupBtn.addEventListener('click', () => {
  const userName = document.querySelector('.user_signup .signup_name').value;
  const userEmail = document.querySelector('.user_signup .signup_email').value;
  const userPassword = document.querySelector('.user_signup .signup_password').value;
  fetch('/api/v1/user/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: userName,
      email: userEmail,
      password: userPassword,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })
    .then((response) => response.json())
    .catch((error) => console.log(error))
    .then((info) => {
      document.cookie = `access_token=${info.data.access_token}`;
      window.location = '/profile.html';
    });
});
