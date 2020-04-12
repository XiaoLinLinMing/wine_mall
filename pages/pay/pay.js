// pages/pay/pay.js
//消息通知
import Notify from '../../dist/notify/notify';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: 'https://www.linhuiqi.top/葡萄酒商城/index.php',
    cityName: "",
    countyName: "",
    detailInfo: "",
    provinceName: "",
    postalCode: "",
    userName: "",
    telNumber: "",
    shop_car: {
      total: 0,
      goods_list: [],
    },
    total:0.0,
    sf_tips:"为保证货品质量，我们将使用顺丰为您配送（运费到付）",
    postage:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    Notify({ type: 'warning', message: '在下方选择地址信息', duration: 1000,});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {


    // 1.加载购物车
    this.data.shop_car = getApp().globalData.shop_car;
    console.log(this.data.shop_car);
    this.setData({
      shop_car: getApp().globalData.shop_car,
      total: parseInt(getApp().globalData.shop_car.total * 100)

    })
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

  //选择地址
  choose_addr:function(){

    var that = this;
    wx.chooseAddress({
      success(res){
        console.log(res);

        that.setData({
          cityName: res.cityName,
          countyName: res.countyName,
          detailInfo: res.detailInfo,
          provinceName: res.provinceName,
          postalCode: res.postalCode,
          userName: res.userName,
          telNumber: res.telNumber
        })

        wx.request({
          url: 'https://www.linhuiqi.top/weChatApp/getPostage.php',
          data:{
            province: res.provinceName[0] + res.provinceName[1],

          },
          success(postage){
            console.log(postage)
            that.setData({
              postage: parseInt(postage.data.first + postage.data.second)
            })
          }
        })
      }

    });
  },

  //提交订单
  onSubmit:function(){

    wx.showLoading({
      title: '请稍等...',
    })

    var that = this;
    if (
      this.data.cityName == ""||
      this.data.countyName == "" ||
      this.data.detailInfo == "" ||
      this.data.provinceName == "" ||
      this.data.postalCode == "" ||
      this.data.userName == "" ||
      this.data.telNumber == "" 
    )
    {
      Notify({ type: 'danger', message: '信息未填写完整！' });
      wx.hideLoading();
      return;
    }

    //订单所含商品列表
    var goods_list = [];
    for (var i = 0; i < this.data.shop_car.goods_list.length; i++){
      goods_list[i] = { 
        "name": this.data.shop_car.goods_list[i].NAME,
        "id": this.data.shop_car.goods_list[i].ID,
        "price": this.data.shop_car.goods_list[i].RECENT_PRICE,
        "qty": this.data.shop_car.goods_list[i].QTY
      }
    }
    var order = {};
    order.province = this.data.provinceName;
    order.city = this.data.cityName;
    order.county = this.data.countyName;
    order.address = this.data.detailInfo;
    order.contact = this.data.userName;
    order.tel = this.data.telNumber;
    order.postal_code = this.data.postalCode
    order.total = parseFloat(this.data.total / 100);
    order.customer_id = getApp().globalData.openid;
    order.goods_list = goods_list;

    //1.开始提交未支付订单
    var request_url = this.data.url + 'c=controller_order_option&m=addOrder&p=';
    wx.request({
      url: that.data.url,
      data:{
        c:"controller_order_option",
        m:"addOrder",
        p: JSON.stringify(order)
      },
      success(res){
        console.log(res);
        var data = {
          total_fee: parseInt(that.data.shop_car.total * 100),
          spbill_create_ip:"0.0.0.0",
          openid: getApp().globalData.openid,
          order_id:res.data.return_content,
        };

        wx.request({
          url: that.data.url,
          data:{
            c: "controller_wechatPay_option",
            m: "orderPay",
            p: JSON.stringify(data)
          },
          success(result){
            console.log(result);
            wx.hideLoading();
            var timeStamp = result.data.return_content.timeStamp.toString(10);
            var nonceStr = result.data.return_content.nonceStr;
            var package_a = "prepay_id=" + result.data.return_content.prepay_id;
            var signType = "MD5";
            var paySign = result.data.return_content.secondSign;
            wx.requestPayment({
              timeStamp: timeStamp,
              nonceStr: nonceStr,
              package: package_a,
              signType: 'MD5',
              paySign: paySign,
              success(payResult) { 

                //console.log(payResult);
                var setPay = { order_id: res.data.return_content};

                wx.request({
                  url: that.data.url,
                  data:{
                    c: "controller_wechatPay_option",
                    m: "setPay",
                    p: JSON.stringify(setPay)
                  },
                  success(setPay){
                    console.log(setPay)
                    wx.reLaunch({
                      url: '../index/index?type=PAY',
                    })
                  }

                })
                


              },
              fail(payResult) { 

                console.log(payResult);
                setTimeout(function(){
                  wx.reLaunch({
                    url: '../index/index?type=NOPAY',
                  })
                },300);

              }
            })
          }
        })
      }
    })
    //JSON.stringify
  },

  //跳转至商品详情
  to_goods_info: function (e) {

    wx.navigateTo({
      url: '../goods_info/goods_info?goods_id=' + e.target.dataset.id,
    })
  },
})