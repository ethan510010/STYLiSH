// 載入fb sdk
(function (d, s, id) {
  let js; const
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) { return; }
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/zh_TW/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
// 初始化
window.fbAsyncInit = function () {
  FB.init({
    appId: '824057248044383',
    cookie: true,
    xfbml: true,
    version: 'v3.1',
  });

  FB.AppEvents.logPageView();
};

// FB.getLoginStatus(function (response) {
//     console.log(response)
//     statusChangeCallback(response);
// });
