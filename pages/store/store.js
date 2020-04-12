import Toast from '../../dist/toast/toast';

Page({

  /**
    * 页面的初始数据
    */
  data: {
    url: 'https://www.linhuiqi.top/葡萄酒商城/index.php?',
    sort: [
      { text: '价格降序', value: "DESC" },
      { text: '价格升序', value: "ASC" }
    ],
    classify:[
      { text: '全部', value: "*"}

    ],
    goods_sort:"ASC",
    goods_classify:"*",
    goods_list:[],

    numOfLoad: 5,
    numOfPage: 1,
    max_num: 0,
    shop_car: false,
    shop_car_goods_list: [],
    //购物车提交订单 订单总金额提示
    shop_car_total_tip: 0.0
  },
  onLoad: function (options) {

    var that = this;
    this.load_goods("*", this.data.numOfPage, this.data.numOfLoad, "ASC", this);
    this.setData({
      shop_car_total_tip: parseInt(getApp().globalData.shop_car.total * 100)
    })
  },


  //滑动至页面底部
  onReachBottom: function () {

    var a = this.data.numOfPage + 1;
    this.setData({
      numOfPage:a
    });
    
    this.load_goods(this.data.goods_classify, this.data.numOfPage, this.data.numOfLoad, this.data.goods_sort, this);
  },

  //加载商品
  load_goods: function (type, numOfPage, numOfLoad, sort, that){
    
    
    wx.request({
      url: that.data.url + 'c=controller_goods_option&m=getGoodsList&p={"classify":"' + type + '","numOfPage":' + numOfPage + ',"numOfLoad":' + numOfLoad + ',"sort":"' + sort+'"}',
      success(res) {
        
        if(res.data.return_content.goods_list.length == 0) {
          
          Toast('无更多商品~');     
          var a = that.data.numOfPage - 1;
          that.setData({
            numOfPage: a
          });  
          console.log(that.data.numOfPage);
          return;
        }
        console.log(res.data.return_content.goods_list);
        var new_arr = that.data.goods_list;
        for (var i = 0; i < res.data.return_content.goods_list.length; i++) {
          res.data.return_content.goods_list[i].COVER_URL = "https://" + res.data.return_content.goods_list[i].COVER_URL;
          res.data.return_content.goods_list[i].QTY = 0;
        }
        
        new_arr = new_arr.concat(res.data.return_content.goods_list);
        that.data.goods_list = [];
        that.setData({
          goods_list : new_arr,
        })
        
        if (numOfPage == 1) {
          //重新加载页面商品购买个数
          var length = getApp().globalData.shop_car.goods_list.length;
          var s = "";
          for (var i = 0; i < length; i++) {

            for (var j = 0; j < that.data.goods_list.length; j++) {
              console.log(that.data.goods_list[j].ID);
              if (that.data.goods_list[j].ID == getApp().globalData.shop_car.goods_list[i].ID) {

                s = "goods_list[" + j + "].QTY";
                that.setData({
                  [s]: getApp().globalData.shop_car.goods_list[i].QTY
                })

              }

            }

          }
        }

        console.log(that.data.goods_list);
      }
    })
  },

  //展示购物车
  open_shop_car: function () {

    this.setData({
      shop_car: true,
      shop_car_goods_list: getApp().globalData.shop_car.goods_list,
      shop_car_total_tip: parseInt(getApp().globalData.shop_car.total * 100)
    });
    console.log(this.data.shop_car_goods_list);
  },

  //关闭购物车
  close_shop_car: function () {

    this.setData({
      shop_car: false,
    });

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

          //重新计算总金额
          length = getApp().globalData.shop_car.goods_list.length;
          for (var i = 0; i < length; i++) {

            new_total += parseFloat(
              getApp().globalData.shop_car.goods_list[i].QTY * getApp().globalData.shop_car.goods_list[i].RECENT_PRICE
            );
          }
          getApp().globalData.shop_car.total = new_total;
          this.setData({
            shop_car_total_tip: parseInt(getApp().globalData.shop_car.total * 100)
          });
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
        var new_obj = this.data.goods_list[e.target.dataset.index];
        new_obj.QTY = e.detail;
        getApp().globalData.shop_car.goods_list.push(new_obj);
        console.log(getApp().globalData.shop_car.goods_list);
      }
    }

    if (length == 0) {

      var new_obj = this.data.goods_list[e.target.dataset.index];
      new_obj.QTY = e.detail;
      getApp().globalData.shop_car.goods_list.push(new_obj);
      console.log(getApp().globalData.shop_car.goods_list);
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

    that.set_goods_qty(e.target.dataset.id, e.detail, that);
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

  //设置商品列表对应的商品购买数
  set_goods_qty: function (id, qty, that) {

    for (var i = 0; i < that.data.goods_list.length; i++) {
      if (id == that.data.goods_list[i].ID) {
        var new_obj = that.data.goods_list[i];
        new_obj.QTY = qty;
        that.data.goods_list[i].QTY = qty
        var s = "goods_list[" + i + "]";
        that.setData({
          [s]: new_obj
        })
      }
    }
    console.log(that.data.goods_list);
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

            if (that.data.goods_list[i].ID == that.data.shop_car_goods_list[i].ID) {
              var s = "goods_list[" + i + "].QTY";
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

  //跳转至商品详情
  to_goods_info:function(e){

    wx.navigateTo({
      url: '../goods_info/goods_info?goods_id=' + e.target.dataset.id,
    })
  },

  //去支付
  to_pay:function(){
    wx.navigateTo({
      url: '../pay/pay',
    })
  },

  /**
   * 生命周期函数--页面初次渲染完毕
   */
  onReady: function () {
    
  },
  /**
     * 生命周期函数--页面初次渲染完毕
     */
  onShow: function () {
    
  },

  //设置排序
  setSort:function(e){
    console.log(e.detail);
    getApp().empty_shop_car();
    this.setData({
      goods_sort: e.detail,
      goods_list:[],
      numOfPage: 1,
      max_num: 0,
      shop_car_total_tip:0.0
    })
    this.load_goods(this.data.goods_classify, this.data.numOfPage, this.data.numOfLoad, e.detail, this);

  },

  setClassify:function(e){
    getApp().empty_shop_car();
    this.setData({
      goods_classify: e.detail,
      goods_list: [],
      numOfPage: 1,
      max_num: 0,
      shop_car_total_tip: 0.0
    })
    this.load_goods(e.detail, this.data.numOfPage, this.data.numOfLoad, this.data.goods_sort, this);

  }
})