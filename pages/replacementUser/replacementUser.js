/**
 * 修改密码
 */
const App = getApp();
let base = App.constants;
//导包
var http = require("../../utils/http.js"); //网络请求
// 用户信息的加密未完成
Page(
  base.pageCheck({
    data: {
      orderData: null
    },
    onLoad(query) {
      // 页面加载
    },
    onReady() {
      // 页面加载完成
    },
    onShow() {
      // 页面显示
    },
    onHide() {
      // 页面隐藏
    },
    onUnload() {
      // 页面被关闭
    },
    onTitleClick() {
      // 标题被点击
    },
    onPullDownRefresh() {
      // 页面被下拉
    },
    onReachBottom() {
      // 页面被拉到底部
    },

    /**
     * 点击处理
     *
     * @param {*} e
     */
    click(e) {
      let _that = this;
      let types = e.currentTarget.dataset.type;
      switch (types) {
        case "save":
          _that.httpSave();
          break;
        case "scan":
          my.scan({
            success(res) {
              base.http.httpPost({
                loading: "保存中...",
                url: "/user/index/getBikeInfo",
                data: {
                  imei: res.code,
                },
                success(res) {
                  console.log(res)
                  my.alert({
                    title: res.msg,
                  });
                  _that.setData({
                    orderData: res.data,
                  });
                },
                fail(res) {
                  _that.setData({
                    orderData: null,
                  });
                }
              });
            }
          });
          break;
      }
    },

    /**
     * 保存数据
     */
    httpSave() {
      let _that = this;
      _that.setData({
        saveIng: true
      });
      base.http.httpPost({
        loading: "提交中...",
        url: "/user/index/changeUser",
        data: {
          order_id: _that.data.orderData.orderId,
        },
        success(res) {
          _that.setData({
            saveIng: false
          });
          my.alert({
            title: res.msg,
            success: result => {
              setTimeout(() => {
                my.reLaunch({
                  url: "/pages/index/index"
                });
              }, 1);
            }
          });
        },
        fail(res) {
          _that.setData({
            saveIng: false
          });
          my.alert({
            title: res.msg
          });
        }
      });
    }
  })
);
