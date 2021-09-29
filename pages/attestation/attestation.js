/**
 * 身份验证
 */
const App = getApp();
let base = App.constants;
//导包
var http = require("../../utils/http.js"); //网络请求
// 用户信息的加密未完成
Page(
  base.pageCheck({
    data: {
      name: "",
      IDnumber: "",
      is_certify: ""
    },
    onLoad(query) {
      // 页面加载
      let token = my.getStorageSync({ key: http.KEY_TOKEN });
      this.setData({
        is_certify: token.data.is_certify
      });
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
        case "later":
          my.confirm({
            title: "温馨提示",
            content: "您可在我的里面继续完成实名验证",
            confirmButtonText: "继续认证",
            cancelButtonText: "我再想想",
            success: result => {
              if (!result.confirm) {
                my.reLaunch({
                  url: "/pages/index/index"
                });
              }
            }
          });
          break;
      }
    },

    /**
     * 输入处理
     *
     * @param {*} e
     */
    inputChange(e) {
      let types = e.currentTarget.dataset.type;
      this.setData({
        [`${types}`]: e.detail.value
      });
    },

    /**
     * 保存数据
     */
    httpSave() {
      let patt = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
      let _that = this;
      if (patt.test(_that.data.IDnumber)) {
        _that.setData({
          saveIng: true
        });
        base.http.httpPost({
          loading: "保存中...",
          url: "/user/index/certify",
          data: {
            real_name: _that.data.name,
            card_no: _that.data.IDnumber
          },
          success(res) {
            _that.setData({
              saveIng: false
            });
            my.setStorageSync({
              key: base.key_token, // 缓存数据的key
              data: res.data // 要缓存的数据
            });
            my.alert({
              title: `${res.msg}`,
              success: result => {
                // setTimeout(() => {
                //   my.navigateTo({
                //     url: "/pages/photoVerification/photoVerification"
                //   });
                // }, 1);
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
      } else {
        my.showToast({
          content: "身份证号格式有误，请检查后再提交！"
        });
        return;
      }
    }
  })
);
