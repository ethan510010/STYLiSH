function getCookie(cname) {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return '';
}

// 如果沒有access_token，直接回到登入頁
if (!getCookie('access_token')) {
  window.location = '/signup_login.html';
} else {
  fetch('/api/v1/user/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getCookie('access_token')}`,
    },
  }).then((res) =>
    // https://stackoverflow.com/questions/36840396/fetch-gives-an-empty-response-body
    res.json()).catch((err) => {
    console.log(err);
  }).then((successResponse) => {
    // 因為我們自己寫的後端 api 如果 token過期會給一串字串 "請重新登入", 經由上面解析之後會變成undefined
    if (typeof successResponse === 'object') {
      // 設定大頭貼
      const userAvatarElement = document.querySelector('.profile_content img');
      userAvatarElement.src = successResponse.data.picture;
      // 設定用戶姓名
      const userNameElement = document.querySelector('.profile_content .user_name');
      userNameElement.textContent = `用戶登入: ${successResponse.data.name}`;
      // 設定用戶email
      const emailElement = document.querySelector('.profile_content .user_email');
      emailElement.textContent = `用戶信箱: ${successResponse.data.email}`;
      // 設定用戶登入方式
      const loginwayElement = document.querySelector('.profile_content .user_login_way');
      const loginWay = successResponse.data.provider === 'facebook' ? 'fb登入' : '一般登入';
      loginwayElement.textContent = `登入方式: ${loginWay}`;
    } else {
      window.location = '/signup_login.html';
    }
  });
}
