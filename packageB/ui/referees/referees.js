/**
 * 修改密码
 */
const App = getApp();
let base = App.constants;
var http = require("../../../utils/http.js"); //网络请求
Page(
  base.pageCheck({
    data: {
      tj_mobile: "" //推荐人号码
    },
    onLoad() {
      // 页面加载
      this.httpGetInfo();
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
     * 加载我的
     */
    httpGetInfo() {
      let _that = this;
      base.http.httpPost({
        loading: "加载中...",
        url: "user/index/newinfo",
        data: {},
        success(res) {
          _that.setData({
            old_mobile: res.data.tjMobile
          });
        }
      });
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
          if (_that.data.tj_mobile == "") {
            my.showToast({
              content: "请完成推荐人手机号的填写"
            });
            return;
          }
          _that.httpSave();
          break;
      }
    },

    /**
     * 输入处理
     *
     * @param {*} e
     */
    inputChange(e) {
      let _that = this;
      let patt = /^1[3456789]\d{9}$/;
      if (patt.test(e.detail.value)) {
        _that.setData({
          tj_mobile: e.detail.value
        });
      } else {
        my.showToast({
          content: "请输入正确的手机号"
        });
      }
    },

    /**
     * 保存数据
     */
    httpSave() {
      let _that = this;
      let tokenObj = my.getStorageSync({ key: http.KEY_TOKEN }).data;
      _that.setData({
        saveIng: true
      });
      base.http.httpPost({
        loading: "保存中...",
        url: "user/index/recommend",
        data: {
          tj_mobile: _that.data.tj_mobile
        },
        success(res) {
          _that.setData({
            saveIng: false
          });
          my.alert({
            title: `${res.msg}`,
            success: result => {
              setTimeout(() => {
                my.navigateBack({});
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
