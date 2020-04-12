// pages/myOrder/myOrder.js

import Toast from '../../dist/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs_active:"UNSHIPPED",
    show_type:"",
    url: 'https://www.linhuiqi.top/葡萄酒商城/index.php?',
    openid:"olSQv5S5iZD16FyPR6zLh4Us5cLE",
    order_list:[],
    goods_list:[],
    order_info:[],
    numOfLoad:6,
    numOfPage:1,
    max_num:0,
    order_info_show:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    try {

      if (options.type == "PAY") {
        this.setData({
          tabs_active:"UNSHIPPED"
        })
        return;
      }

      if (options.type == "NOPAY") {
        this.setData({
          tabs_active: "UNPAID"
        })
        return;
      }

    }
    finally {

    }

    that.load_order_by_type(this.data.tabs_active, this, this.data.numOfPage, this.data.numOfLoad);
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

    if (this.data.numOfPage == this.data.max_num) {
      Toast('无更多信息~');
      return;
    }
    console.log("底部");
    var a = this.data.numOfPage + 1;
    this.load_order_by_type(this.data.tabs_active, this, a, this.data.numOfLoad);

    this.setData({
      numOfPage : a
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  tabs_change:function(e){
    console.log(e.detail.name);
    this.setData({
      order_list: [],
      show_type: e.detail.name,
      numOfPage: 1,
      max_num: 0,
    })
    this.load_order_by_type(e.detail.name, this, this.data.numOfPage, this.data.numOfLoad)
  },

  load_order_by_type:function(type, that, numOfPage, numOfLoad){
    
    wx.showLoading({
      title: "请稍等",
      mask: true
    });

    var s = 'c=controller_order_option&m=getOrderList&p={"customer_id":"' + getApp().globalData.openid + '",';
    s += '"classify":"' + type + '","numOfPage":"' + numOfPage + '","numOfLoad":"' + numOfLoad+'"}';  
    wx.request({
      url: that.data.url + s,
      success(res) {
        
        console.log(res);
        if (numOfPage == 1){
          var max ;
          if (res.data.return_content.count < that.data.numOfLoad)
            max = 1;
          else {

            var a = res.data.return_content.count % that.data.numOfLoad;
            if (a == 0)
              max = res.data.return_content.count / that.data.numOfLoad;
            else
              max = parseInt((res.data.return_content.count / that.data.numOfLoad)) + 1;
              
          }

          that.setData({
            max_num: max
          })

          wx.hideLoading();
        }


        var new_arr = that.data.order_list;
        new_arr = new_arr.concat(res.data.return_content.result);
        that.setData({
          order_list: new_arr
        })

        console.log(that.data.order_list);
        wx.hideLoading();
      }
    })
    
  },

  //显示订单详情
  show_order_info:function(e){


    var order_id = e.target.dataset.id;

    this.setData({

      goods_list: this.data.order_list[e.target.dataset.index].GOODS_LIST,
      order_info: this.data.order_list[e.target.dataset.index],
      order_info_show: true
    });

    console.log(this.data.goods_list);
  },

  //关闭订单详情框
  close_show_info:function(){

    this.setData({ order_info_show: false});
  },

  //取消支付
  cancel_pay:function(e){

    var that = this;
    var param = {"order_id" : e.target.dataset.id};
    console.log(e.target.dataset.id);

    wx.showModal({
      title: '提醒',
      content: '是否取消支付该订单？',
      success(res) {
        if (res.confirm) {
          //取消订单
          wx.request({
            url: that.data.url,
            data:{
              c: "controller_order_option",
              m: "cancelPay",
              p: JSON.stringify(param)
            },
            success(res){

              console.log(res);
              that.data.order_list.splice(e.target.dataset.index, 1);
              that.setData({
                order_list: that.data.order_list
              })
              
            }
          })
          
          
        } else if (res.cancel) {
          return;
        }
      }
    })
  },

  //继续支付
  keep_pay:function(e){

    var that = this;
    var data = {
      total_fee: parseInt(e.target.dataset.total * 100),
      spbill_create_ip: "0.0.0.0",
      openid: getApp().globalData.openid,
      order_id: e.target.dataset.id,
    };
    console.log(parseInt(e.target.dataset.total * 100));
    wx.request({
      url: that.data.url,
      data: {
        c: "controller_wechatPay_option",
        m: "orderPay",
        p: JSON.stringify(data)
      },
      success(result) {
        console.log(result);
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
          success(res) {
            
            var setPay = { order_id: e.target.dataset.id};
            wx.showLoading({
              title:"请稍等",
              mask:true
            });

            wx.request({
              url: that.data.url,
              data: {
                c: "controller_wechatPay_option",
                m: "setPay",
                p: JSON.stringify(setPay)
              },
              success(setPay) {
                that.data.order_list.splice(e.target.dataset.index, 1);
                that.setData({
                  order_list: that.data.order_list
                })
                wx.hideLoading();
              }

            })
          },
          fail(res) {

           
          }
        })
      }
    })
  },

  //跳转至商品详情
  to_goods_info: function (e) {

    wx.navigateTo({
      url: '../goods_info/goods_info?goods_id=' + e.target.dataset.id,
    })
  },
})