// pages/goods_info/goods_info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    linAd: [
    ],
    show_add_panel:false,
    url: 'https://www.linhuiqi.top/葡萄酒商城/index.php?',
    goods_info:{},
    goods_id:"",
    shop_car: false,
    shop_car_goods_list: [],
    //购物车提交订单 订单总金额提示
    shop_car_total_tip: 0.0,

    //图片放大
    img_scale_src: "",
    display_img_scale: false,
    xiajia:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: "请稍等",
      mask: true
    });

    this.setData({
      goods_id: options.goods_id,
    })

    var that = this;
    var request_str = this.data.url + 
      'c=controller_goods_option&m=getGoodsInfo&p={"product_id":"' + that.data.goods_id + '","customer_id":"' + getApp().globalData.openid +'"}';

    wx.request({
      url: request_str,
      success(res){
        console.log(res.data);
        if(res.data.code_no == 0){

          that.setData({
            xiajia:true,
          });
          wx.hideLoading();
          return;
        }
        var s = "linAd[0]";
        var new_obj = { url: "https://"+ res.data.return_content[0].COVER_URL, id: 1};
        res.data.return_content[0].QTY = 0;
        res.data.return_content[0].COVER_URL = "https://" + res.data.return_content[0].COVER_URL;
        that.setData({

          goods_info: res.data.return_content[0],
          [s]: new_obj,
          shop_car_total_tip: parseInt(getApp().globalData.shop_car.total * 100)
        })

        console.log(that.data.goods_info);
        wx.hideLoading();
      }
    })


    // 2.加载商品详情图片
    request_str = this.data.url + 'c=controller_goods_option&m=getGoodsInfoPtc&p={"goods_id":"' + that.data.goods_id+'"}';
    wx.request({
      url: request_str,
      success(res) {
      
        console.log(res);
        var new_arr = [], new_obj = {};

        for(var i = 0; i<res.data.return_content.length; i++){

          //new_obj.url = "https://" + res.data.return_content[i].IMG_URL;
          //new_obj.id = res.data.return_content[i].IMG_ID;
          new_arr[i] = { url: "https://" + res.data.return_content[i].IMG_URL, id: res.data.return_content[i].IMG_ID};

        }
        console.log(new_arr);
        var arr = that.data.linAd;
        arr = arr.concat(new_arr);
        that.setData({
          linAd: arr,
        })
        
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

  show_add_panel:function(){

    this.setData({
      show_add_panel:true
    })
  },

  close_show_add_panel:function(){
    this.setData({

      show_add_panel: false,
    })
  },

  collect:function(e){
    console.log(e.target.dataset.id);
    var that = this;
    var info = { "product_id": e.target.dataset.id, "customer_id":getApp().globalData.openid};
    wx.request({
      url: that.data.url,
      data:{
        c: "controller_goods_option",
        m: "goodsCollect",
        p: JSON.stringify(info)
      },
      success(res){
        console.log(res);
        var s = "goods_info.COLLECT";
        if(that.data.goods_info.COLLECT == 0)
          that.setData({
            [s] : 1
          })
        else
          that.setData({
            [s]: 0
          })
        
      }
    })
  },

  //关闭购物车
  close_shop_car: function () {

    this.setData({
      shop_car: false,
    });

  },

  //展示购物车
  open_shop_car: function () {

    this.setData({
      shop_car: true,
      shop_car_goods_list: getApp().globalData.shop_car.goods_list
    });
    console.log(this.data.shop_car_goods_list);
  },

  //在购物车里面设置商品
  set_car_on_shop: function (e) {

    var that = this;
    var length = getApp().globalData.shop_car.goods_list.length;
    for (var i = 0; i < length; i++) {

      if (e.target.dataset.id == getApp().globalData.shop_car.goods_list[i].ID) {

        if (e.detail == 0) {

          getApp().globalData.shop_car.goods_list.splice(i, 1);
          var new_arr = getApp().globalData.shop_car.goods_list;
          this.setData({
            shop_car_goods_list: getApp().globalData.shop_car.goods_list,
          })

          break;
        }

        getApp().globalData.shop_car.goods_list[i].QTY = e.detail;

      }
    }
    var new_total = 0.0;
    for (var i = 0; i < getApp().globalData.shop_car.goods_list.length; i++) {

      new_total += parseFloat(
        getApp().globalData.shop_car.goods_list[i].QTY * getApp().globalData.shop_car.goods_list[i].RECENT_PRICE
      );
    }

    getApp().globalData.shop_car.total = new_total;
    //设置购物车总金额提示
    that.setData({
      shop_car_total_tip: parseInt(new_total * 100)
    })
    console.log(new_total);
  },

  //清空购物车
  empty_shop_car: function () {

    var that = this;

    if (this.data.shop_car_goods_list.length == 0) return;
    var that = this;
    wx.showModal({
      title: '提醒',
      content: '是否清空购物车？',
      success(res) {
        if (res.confirm) {

          //从这里开始清空所有购买数
          getApp().empty_shop_car();
          that.setData({
            shop_car_goods_list: []
          })

          console.log(getApp().globalData.shop_car);
        } else if (res.cancel) {
          return;
        }
      }
    })

  },

  //设置购物车
  set_car: function (e) {
    //console.log(e.detail);

    var that = this;
    //购物车总金额
    var new_total = 0.0;
    //return;
    var length = getApp().globalData.shop_car.goods_list.length;
    var shop_car = getApp().globalData.shop_car.goods_list;

    for (var i = 0; i < length; i++) {
      if (e.target.dataset.id == shop_car[i].ID) {

        //若该商品购买数为0则从购物车中删除
        if (e.detail == 0) {
          getApp().globalData.shop_car.goods_list.splice(i, 1);
          console.log(getApp().globalData.shop_car.goods_list);
          return;
        }

        getApp().globalData.shop_car.goods_list[i].QTY = e.detail;

        //计算总金额
        for (var i = 0; i < length; i++) {

          new_total += parseFloat(
            getApp().globalData.shop_car.goods_list[i].QTY * getApp().globalData.shop_car.goods_list[i].RECENT_PRICE
          );
        }
        getApp().globalData.shop_car.total = new_total;
        //设置购物车总金额提示
        that.setData({
          shop_car_total_tip: parseInt(new_total * 100)
        })
        console.log(getApp().globalData.shop_car.goods_list);
        return;
      }

      if (i == length - 1) {
        var new_obj = this.data.goods_info;
        new_obj.QTY = e.detail;
        getApp().globalData.shop_car.goods_list.push(new_obj);
        console.log("1");
      }

    }

    if (length == 0) {

      var new_obj = this.data.goods_info;
      new_obj.QTY = e.detail;
      getApp().globalData.shop_car.goods_list.push(new_obj);
      console.log(getApp().globalData.shop_car.goods_list);
      console.log("0");
    }

    //计算总金额
    new_total = 0.0;
    for (var i = 0; i < getApp().globalData.shop_car.goods_list.length; i++) {

      new_total += parseFloat(
        getApp().globalData.shop_car.goods_list[i].QTY * getApp().globalData.shop_car.goods_list[i].RECENT_PRICE
      );
    }

    getApp().globalData.shop_car.total = new_total;
    //设置购物车总金额提示
    that.setData({
      shop_car_total_tip: parseInt(new_total * 100)
    })
  },
  set_goods_qty: function () {
    
    var s = "goods_info.QTY";
    for (var i = 0; i < getApp().globalData.shop_car.goods_list.length; i++) {

      if (this.data.goods_info.ID == getApp().globalData.shop_car.goods_list[i].ID){

        
        this.setData({
          [s] : getApp().globalData.shop_car.goods_list[i].QTY
        })
        console.log("pl");
        return;
      }
      
      this.setData({
        [s]: 0
      })

    }

    if (getApp().globalData.shop_car.goods_list.length == 0)
      this.setData({
        [s]: 0
      })
  },

  //去支付
  to_pay: function () {
    wx.navigateTo({
      url: '../pay/pay',
    })
  },

  //放大图片
  show_img_scale:function(e){

    this.setData({
      img_scale_src :e.target.dataset.src,
      display_img_scale: true
    })
  },

  //取消放大图片
  hide_img_scale:function(){
    this.setData({
      display_img_scale: false
    })
  },

  //linAdClick()
  linAdClick:function(e){
    this.setData({
      img_scale_src: e.target.dataset.src,
      display_img_scale: true
    })
  },

  //跳转至主页
  hide_xiajia:function(){
    wx.reLaunch({
      url: '../index/index',
    })
  }
})