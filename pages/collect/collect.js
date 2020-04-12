// pages/collect/collect.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: 'https://www.linhuiqi.top/葡萄酒商城/index.php?',
    goods_list:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: "请稍等",
      mask: true
    });

    var that = this;
    var data = {"customer_id" : getApp().globalData.openid};
    wx.request({
      url: that.data.url,
      data:{
        c: "controller_goods_option",
        m: "getCustomerCollect",
        p: JSON.stringify(data)
      },
      success(res){
        console.log(res);
        for(var i = 0; i<res.data.return_content.length;i++){
          res.data.return_content[i].COVER_URL = "https://" + res.data.return_content[i].COVER_URL
        }
        that.setData({
          goods_list: res.data.return_content
        })
        console.log(res);
        wx.hideLoading();
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  //跳转至商品详情
  to_info:function(e){
    wx.navigateTo({
      url: '../goods_info/goods_info?goods_id=' + e.target.dataset.id,
    })
  }
})