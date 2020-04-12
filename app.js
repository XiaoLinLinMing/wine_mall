//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    appid:"wxe75a2302eb39a86d",
    secret:"7d819c5828f67676cf7e6e62859b550c",
    openid:"",
    mch_id:"1514949491",
    access_token:"",
    shop_car:{
      total:0,
      goods_list:[],
    }
  },

  empty_shop_car:function(){

    if(this.globalData.shop_car.goods_list.length == 0)return;
    this.globalData.shop_car.goods_list = [];
    this.globalData.shop_car.total = 0.0;
  }
})