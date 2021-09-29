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
        case "frontSide":
        case "reverseSide":
          my.chooseImage({
            count: 1,
            success: res => {
              console.log(res.apFilePaths);
              base.http.uploadFile({
                url: "user/index/uploadImage",
                filePath: res.apFilePaths[0],
                name: "file",
                fileType: "image",
                success(result) {
                  console.log(result);
                  if (types === "frontSide") {
                    let frontSideUrl = res.apFilePaths[0];
                    let frontSideUrl1 = result.data;
                    _that.setData({
                      frontSideUrl,
                      frontSideUrl1
                    });
                  } else if (types === "reverseSide") {
                    let reverseSideUrl = res.apFilePaths[0];
                    let reverseSideUrl1 = result.data;
                    _that.setData({
                      reverseSideUrl,
                      reverseSideUrl1
                    });
                  }
                }
              });
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
      let _that = this;
      base.http.httpPost({
        loading: "提交中...",
        url: "user/index/saveCardImage",
        data: {
          card_image: _that.data.frontSideUrl1,
          card_image_back: _that.data.reverseSideUrl1
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
