/**
 * 我的
 */
let App = getApp();
let base = App.constants;
Page(
  base.pageCheck({
    data: {
      isZmAuth: true, //芝麻授权
      userInfo: "",
      is_change: 1,//是否绑定了基本信息
      menuList: [
        {
          name: "我的收藏",
          url: "/packageB/ui/myBattery/myBattery",
          type: "navigate"
        },
        {
          name: "我的优惠券",
          url: "/packageB/ui/myOrder/myOrder",
          type: "navigate"
        },
        {
          name: "联系我们",
          type: "callPhone"
        },
        {
          name: "收货地址",
          url: "/packageB/ui/referees/referees",
          type: "navigate"
        },

      ]

    },
    onLoad(query) {
      // 页面加载
      // this.httpGetInfo();
    },
    onReady() {
      // 页面加载完成
    },
    onShow() {
      // 页面显示
      this.setData({
        isZmAuth: base.is_auth,
        is_login: base.mobile != 0
      });
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
      // this.httpGetInfo();
      my.stopPullDownRefresh();
    },
    onReachBottom() {
      // 页面被拉到底部
    },

    /**
     * 点击
     */
    click(e) {
      let _that = this;
      let types = e.currentTarget.dataset.type;
      console.log(_that, types);
      switch (types) {
        case "callPhone":
          let value = _that.data.kf_tel;
          console.log(value);
          my.makePhoneCall({
            number: "" + value // 电话号码
          });
          break;
        case "yiJie":
          base.http.httpPost({
            loading: "加载中...",
            url: "/user/index/jointLogin",
            success(res) {
              my.navigateTo({
                url: "/pages/webView/webView?url=" + res.data
              });
            }
          });
          break;
        case "navigate":
          //跳转
          let url = e.currentTarget.dataset.value;
          if (App.checkLogin(true)) {
            if (url == "/packageB/ui/referees/referees") {
              my.navigateTo({
                url: _that.data.tj_mobile
                  ? "/packageB/ui/referees/referees?tj_mobile=" +
                  _that.data.tj_mobile
                  : "/packageB/ui/referees/referees"
              });
            } else {
              my.navigateTo({
                url: url
              });
            }
          }
          break;
        case "authZhiMa":
          App.authZhima(() => {
            base.is_auth = 1;
            _that.setData({
              isZmAuth: 1
            });
            _that.httpGetInfo();
          });
          break;
        case "applyCancelAuth":
          //申请解冻
          my.confirm({
            content: "是否确认取消信用授权？",
            confirmButtonText: "马上取消",
            cancelButtonText: "我再想想",
            success: res => {
              if (res.confirm) {
                base.http.httpPost({
                  url: "user/index/unfreeze",
                  data: {},
                  success(resule) {
                    base.is_auth = 0;
                    _that.setData({
                      isZmAuth: 0
                    });
                    my.showToast({
                      content: "解授成功"
                    });
                  }
                });
              }
            }
          });
          break;
        case "test":
          base.http.httpPost({
            url: "user/index/testzhima",
            data: {},
            success(result) {
              my.tradePay({
                orderStr: result.data.orderStr,
                success: res => {
                  if (res.resultCode == 9000) {
                    my.showToast({
                      type: "success",
                      content: "认证成功"
                    });
                    _that.constants.is_auth = 1;
                    if (callback_success) {
                      callback_success();
                    }
                  }
                }
              });
            }
          });
          break;
      }
    },

    /**
     * 获取支付宝手机号
     *
     * @param e
     */
    onGetAuthorize(e) {
      let _that = this;
      my.getOpenUserInfo({
        fail: res => { },
        success: res => {
          let userInfo = JSON.parse(res.response).response; // 以下方的报文格式解析两层 response
          _that.httpBindUser(userInfo);
        }
      });
    },
    //绑定基本信息
    httpBindUser(userInfo) {
      let _that = this;
      base.http.httpPost({
        url: "user/index/change",
        data: userInfo,
        success(resule) {
          _that.setData({
            is_change: 1,
            userInfo: userInfo
          });
        }
      });
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
          if (res.data.creditVisible === 1) {
            let menuList = [
              {
                name: "我的订单",
                url: "/packageB/ui/myOrder/myOrder",
                type: "navigate"
              },
              {
                name: "我的车辆",
                url: "/packageB/ui/myVehicle/myVehicle",
                type: "navigate"
              },
              {
                name: "我的电池",
                url: "/packageB/ui/myBattery/myBattery",
                type: "navigate"
              },
              {
                name: "身份验证",
                url: "/packageB/ui/authentication/authentication",
                type: "navigate"
              },
              {
                name: "我的银行卡",
                url: "/packageA/ui/myBankcard/myBankcard",
                type: "navigate"
              },
              {
                name: "易借",
                sub: `（${res.data.creditText}）`,
                type: "yiJie"
              },
              {
                name: "推荐人",
                url: "/packageB/ui/referees/referees",
                type: "navigate"
              },
              {
                name: "联系我们",
                type: "callPhone"
              },
              {
                name: "租车指南",
                url: "/pages/webView/webView?url=" + base.termsUrl + "?id=t3",
                type: "navigate"
              },
              {
                name: "失信危害",
                url: "/pages/webView/webView?url=" + base.termsUrl + "?id=t2",
                type: "navigate"
              },
              {
                name: "盗抢险免赔服务条例",
                url: "/pages/webView/webView?url=" + base.termsUrl + "?id=t4",
                type: "navigate"
              }
            ];
            _that.setData({
              menuList
            });
          } else {
            let menuList = [
              {
                name: "我的订单",
                url: "/packageB/ui/myOrder/myOrder",
                type: "navigate"
              },
              {
                name: "我的车辆",
                url: "/packageB/ui/myVehicle/myVehicle",
                type: "navigate"
              },
              {
                name: "我的电池",
                url: "/packageB/ui/myBattery/myBattery",
                type: "navigate"
              },
              {
                name: "身份验证",
                url: "/packageB/ui/authentication/authentication",
                type: "navigate"
              },
              {
                name: "我的银行卡",
                url: "/packageA/ui/myBankcard/myBankcard",
                type: "navigate"
              },
              {
                name: "推荐人",
                url: "/packageB/ui/referees/referees",
                type: "navigate"
              },
              {
                name: "联系我们",
                type: "callPhone"
              },
              {
                name: "租车指南",
                url: "/pages/webView/webView?url=" + base.termsUrl + "?id=t3",
                type: "navigate"
              },
              {
                name: "失信危害",
                url: "/pages/webView/webView?url=" + base.termsUrl + "?id=t2",
                type: "navigate"
              },
              {
                name: "盗抢险免赔服务条例",
                url: "/pages/webView/webView?url=" + base.termsUrl + "?id=t4",
                type: "navigate"
              }
            ];
            _that.setData({
              menuList
            });
          }
          _that.setData({
            "userInfo.avatar": res.data.avatar,
            "userInfo.nickName": res.data.username,
            "userInfo.auth_money": res.data.auth_money,
            "userInfo.mobile": res.data.mobile,
            is_change: res.data.is_change,
            isZmAuth: res.data.is_auth,
            kf_tel: res.data.kf_tel,
            tj_mobile: res.data.tjMobile
          });
          base.is_auth = res.data.is_auth;
        }
      });
    }
  })
);
