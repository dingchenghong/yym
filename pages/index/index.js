//index.js
//获取应用实例
const app = getApp()

function getUrlParam(u, p) {
  var arrObj = u.split("?");
  if (arrObj.length > 1) {
    var arrPara = arrObj[1].split("&");
    var arr;
    for (var i = 0; i < arrPara.length; i++) {
      　arr = arrPara[i].split("=");
      　if (arr != null && arr[0] == p) {
        　　return arr[1];
      　}
    }
    return null;
  }else {
    return null;
  }
}

function success_jsonpCallback(data) {
  try {
    console.log(data);
    // 获取并设置开始时间
    if (data.sku.startTime) {
      var d = new Date();
      d.setTime(data.sku.startTime);
    } else {
      console.log("start time is empty...")
    }

    // 获取barCode
    var key = data.sku.sku[0].pName + ":" + data.sku.sku[0].pList[0];
    var availSku = data.sku.availSku;
    var startIndex = availSku.indexOf("\"outItemId\":\"");
    startIndex += "\"outItemId\":\"".length;
    var endIndex = availSku.indexOf("\",\"skuSmallImg");
    var gg = availSku.substring(startIndex, endIndex);
    if (gg) {
      console.log(gg);
    } else {
      console.log("get bar code error...")
    }
  } catch (error) {
    console.log("获取开始时间和购物车barCode时异常")
    console.log(error);
  }
}

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    goodsUrl: '',
    itemId:0,
    barCode: "",
    startTime:0
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  setGoodsUrl: function(e) {
    this.setData({goodsUrl: e.detail.value})
  },
  getGoodsBarCode: function(e) {
    const that = this
    const itemId = getUrlParam(this.data.goodsUrl, "itemId")
    const skipId = getUrlParam(this.data.goodsUrl, "spikeActivityId")
    wx.showModal({
      content: "商品ItemId:" + itemId + ", skipId:" + skipId,
      showCancel: false
    });
    wx.request({
      url: "https://blog.dinginfo.com/auto-new/get-info/" + itemId + "/" + skipId,
      header: {
        // "Content-Type":"application/json"
      },
      success: function (res) {
        console.log(res.data)
        if(res.data.code == 200){
          // 获取barCode
          const jsonObj = JSON.parse(res.data.data);
          const startTime = jsonObj.startTime;
          that.setData({startTime: startTime})
          that.setData({barCode: jsonObj.objItemBo.barCode})
          if (jsonObj && jsonObj.objItemBo.barCode) {
            wx.showModal({
              content: "barCode is:" + jsonObj.objItemBo.barCode,
              showCancel: false
            });
            console.log("barCode is:" + jsonObj.objItemBo.barCode);
          } else {
            wx.showModal({
              content: "获取商品信息失败",
              showCancel: false
            });
          }
        }
      },
      fail: function (err) {
        console.log(err)
        wx.showModal({
          content: "获取商品信息失败,[error]", 
          showCancel: false
        });
      }

    })


  }
})
