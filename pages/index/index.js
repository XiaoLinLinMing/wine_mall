// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: 'https://www.linhuiqi.top/葡萄酒商城/index.php?',
    top_ad:"https://www.linhuiqi.top/葡萄酒商城/view/img/top.jpg",
    logo: "https://www.linhuiqi.top/葡萄酒商城/view/img/logo.jpg",
    heng1:"https://www.linhuiqi.top/img/heng1.jpg",
    linAd:[
      {url:"https://www.linhuiqi.top/img/ad0.jpg",id:1},
      {url:"https://www.linhuiqi.top/img/ad1.jpg",id:2},
    ],
    tab_active:0,
    search_value:"",
    test:"http://www.linhuiqi.top/%E8%91%A1%E8%90%84%E9%85%92%E5%95%86%E5%9F%8E/view/goods_cover/1574579586.jpg",
    recommend_goods_list:[
    ],
    shop_car:false,
    shop_car_goods_list:[],
    //购物车提交订单 订单总金额提示
    shop_car_total_tip: 0.0,
    //用户收藏数
    collect_sum:0,
    //商品详情最大显示字数
    info_max:30,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    try{

      if (options.type == "PAY") {
        wx.navigateTo({
          url: '../myOrder/myOrder?type=PAY',
        })
      }
      if (options.type == "NOPAY") {
        wx.navigateTo({
          url: '../myOrder/myOrder?type=NOPAY',
        })
      }
      
    }
  finally{

  }

    //2020-3-20 20:29:29补丁 添加访客数据
    wx.request({
      url: that.data.url + "c=controller_page_option&m=addClientSum&p={}",
      success(res){
        console.log(res)
      }
    })

    // 1.加载推荐商品
    wx.request({
      url: that.data.url + "c=controller_goods_option&m=getRecommendGoods&p={}",
      success(res){
        //console.log(res.data);
        var new_arr = [];
        for (var i = 0; i < res.data.return_content.length; i++){
          res.data.return_content[i].COVER_URL = "https://" + res.data.return_content[i].COVER_URL;
          res.data.return_content[i].QTY = 0;
          new_arr[i] = res.data.return_content[i];
        }
        that.setData({
          recommend_goods_list:new_arr
        });
        console.log(new_arr);
      }
    })
    
    //登录获取 openid
    wx.login({
      success(res) {
        
        if (res.code) {

          //发起网络请求
          var s = 'c=controller_page_option&m=getOpenid&p={"appid":"' + getApp().globalData.appid+'",';
          s += '"secret":"' + getApp().globalData.secret+'",';
          s += '"grant_type":"authorization_code",';
          s += '"js_code":"' + res.code + '"}';
 
          wx.request({
            url: that.data.url + s,
            success(res){

              getApp().globalData.openid = res.data.openid;
              

              //2. 获取用户收藏数
              var user = { customer_id: getApp().globalData.openid };
              wx.request({
                url: that.data.url,
                data: {
                  c: "controller_goods_option",
                  m: "getUserCollectCount",
                  p: JSON.stringify(user)
                },

                success(res) {

                  that.setData({
                    collect_sum: res.data.return_content
                  })
                  console.log(res);
                }
              })
            }
          })
        }
        else {
          console.log('登录失败！' + res.errMsg)
        }

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

    
    //重新加载页面商品购买个数
    var length = getApp().globalData.shop_car.goods_list.length;
    var that = this;
    var s = "shop_car_goods_list.length";
    that.setData({
      [s]: getApp().globalData.shop_car.goods_list.length,
    })

    for(var i = 0; i<length; i++){

      for (var j = 0; j < this.data.recommend_goods_list.length; j++){
        s = "recommend_goods_list[" + j + "].QTY";
        if (this.data.recommend_goods_list[j].ID == getApp().globalData.shop_car.goods_list[i].ID){

          this.setData({
            [s]: getApp().globalData.shop_car.goods_list[i].QTY
          })
        }
        else{

          this.setData({
            [s]: 0
          })
        }
 
      }

    
    }

    if(length == 0){
      for (var j = 0; j < this.data.recommend_goods_list.length; j++) {
        s = "recommend_goods_list[" + j + "].QTY";
        this.setData({
          [s]: 0
        })
      }
    }

    //重新计算总金额
    var length = getApp().globalData.shop_car.goods_list.length;
    var new_total = 0.0;
    for (var i = 0; i < length; i++) {

      new_total += parseFloat(
        getApp().globalData.shop_car.goods_list[i].QTY * getApp().globalData.shop_car.goods_list[i].RECENT_PRICE
      );
    }

    this.setData({
      shop_car_total_tip: parseInt(new_total * 100)
    });

    //重新加载用户收藏商品数
    var user = { customer_id: getApp().globalData.openid };
    console.log(getApp().globalData.openid);
    wx.request({
      url: that.data.url,
      data: {
        c: "controller_goods_option",
        m: "getUserCollectCount",
        p: JSON.stringify(user)
      },

      success(res) {

        that.setData({
          collect_sum: res.data.return_content
        })

      }
    })

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

  //设置底部导航栏
  on_tab_change(event) {
    this.setData({ tab_active: event.detail });
  },
  on_search_change(e) {
    this.setData({
      search_value: e.detail
    });
  }
  ,
  start_search() {
    if (this.data.value) {
      wx.showToast({
        title: '搜索：' + this.data.search_value,
        icon: 'none'
      });
    }
  },

  //商品展示跳转
  to_store:function(){
    wx.navigateTo({
      url: '../store/store',
    })
  },

  //设置购物车
  set_car:function(e){
    //console.log(e.detail);
    
    var that = this;
    //购物车总金额
    var new_total = 0.0;
    //return;
    var length = getApp().globalData.shop_car.goods_list.length;
    var shop_car = getApp().globalData.shop_car.goods_list;
    
    for(var i = 0; i<length; i++){
      if(e.target.dataset.id == shop_car[i].ID){

        //若该商品购买数为0则从购物车中删除
        if (e.detail == 0) {
          getApp().globalData.shop_car.goods_list.splice(i,1);
          console.log(getApp().globalData.shop_car.goods_list);
          //重新计算总金额
          length = getApp().globalData.shop_car.goods_list.length;
          for (var i = 0; i < length; i++) {

            new_total += parseFloat(
              getApp().globalData.shop_car.goods_list[i].QTY * getApp().globalData.shop_car.goods_list[i].RECENT_PRICE
            );
          }
          getApp().globalData.shop_car.total = new_total;
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
      if(i == length-1){
        var new_obj = this.data.recommend_goods_list[e.target.dataset.index];
        new_obj.QTY = e.detail;
        getApp().globalData.shop_car.goods_list.push(new_obj);
        console.log(getApp().globalData.shop_car.goods_list);
      }
    }

    if (length == 0){

      var new_obj = this.data.recommend_goods_list[e.target.dataset.index];
      new_obj.QTY = e.detail;
      getApp().globalData.shop_car.goods_list.push(new_obj);
      console.log(getApp().globalData.shop_car.goods_list);
    }

    //计算总金额
    new_total = 0.0;
    for (var i = 0; i < getApp().globalData.shop_car.goods_list.length; i++){

      new_total += parseFloat(
        getApp().globalData.shop_car.goods_list[i].QTY * getApp().globalData.shop_car.goods_list[i].RECENT_PRICE
      );
    }

    getApp().globalData.shop_car.total = new_total;
    //设置购物车总金额提示
    var s = "shop_car_goods_list.length";
    that.setData({
      shop_car_total_tip: parseInt(new_total * 100),
      [s]: getApp().globalData.shop_car.goods_list.length,
    })

  },

  //我的订单跳转
  to_my_order:function(){

    wx.navigateTo({
      url: '../myOrder/myOrder',
    })
  },

  //主页跳转
  to_index:function(){

    wx.navigateTo({
      url: '../index/index',
    })
  },

  //关闭购物车
  close_shop_car:function(){

    this.setData({
      shop_car: false,
    });
    
  },

  //展示购物车
  open_shop_car:function(){
    
    this.setData({
      shop_car: true,
      shop_car_goods_list: getApp().globalData.shop_car.goods_list
    });
    console.log(this.data.shop_car_goods_list);
  },


  //在购物车里面设置商品
  set_car_on_shop:function(e){

    var that = this;
    var length = getApp().globalData.shop_car.goods_list.length;
    for(var i = 0; i<length; i++){

      if (e.target.dataset.id == getApp().globalData.shop_car.goods_list[i].ID){

        if (e.detail == 0){

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

    that.set_goods_qty(e.target.dataset.id, e.detail, that);
    var new_total = 0.0;
    for (var i = 0; i < getApp().globalData.shop_car.goods_list.length; i++){
      
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


  //设置商品列表对应的商品购买数
  set_goods_qty:function(id, qty, that){
    
    for(var i = 0; i< that.data.recommend_goods_list.length; i++){
      if (id == that.data.recommend_goods_list[i].ID){
        var new_obj = that.data.recommend_goods_list[i];
        new_obj.QTY = qty;
        that.data.recommend_goods_list[i].QTY = qty
        var s = "recommend_goods_list["+i+"]";
        that.setData({
          [s]: new_obj
        })
      }
    }
    console.log(that.data.recommend_goods_list);
  },

  //跳转至商品详情
  to_goods_info: function (e) {

    wx.navigateTo({
      url: '../goods_info/goods_info?goods_id=' + e.target.dataset.id,
    })
  },

  //
  contact_error:function(){
    console.log("错误");
  },

  //清空购物车
  empty_shop_car: function () {

    var that = this;
    if (this.data.shop_car_goods_list.length == 0) return;
    wx.showModal({
      title: '提醒',
      content: '是否清空购物车？',
      success(res) {
        if (res.confirm) {


          //清空所有商品购买数
          for (var i = 0; i < that.data.shop_car_goods_list.length; i++) {

            if (that.data.recommend_goods_list[i].ID == that.data.shop_car_goods_list[i].ID) {
              var s = "recommend_goods_list[" + i + "].QTY";
              that.setData({
                [s]: 0
              })
              console.log("ok");
            }

          }

          //从这里开始清空所有购物车商品
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
  //去支付
  to_pay: function () {
    wx.navigateTo({
      url: '../pay/pay',
    })
  },

  //跳转至收藏页面
  to_collect:function(){
    wx.navigateTo({
      url: '../collect/collect',
    })
  }
})