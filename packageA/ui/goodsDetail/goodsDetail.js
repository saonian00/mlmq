/**
 * 商品详情
 */
var http = require("../../../utils/http.js"); //网络请求
var wxParse = require("/utils/xParse/wxParse.js");
let App = getApp();
let base = App.constants;
let payTimer = null;
Page(
  base.pageCheck({
    data: {
      locationAuth: false, //获取地理位置权限
      zhima_zuth: 0, //是否芝麻授权了 1授权 0未授权
      p_id: "",
      lat: "",
      lon: "",
      saveIng: false,
      swiperIndex: 1,
      insurance: false, //是否选中保险
      insuranced: false, //是否确认不要保险
      goodsSelectDialogShow: false,
      packageInfo: {
        thumb: [1]
      },
    },

    onLoad(query) {
      console.log(query)
    },
    onLoad(query) {
      // 页面加载
      let _that = this;
      if (query.p_id) {
        this.setData({
          p_id: query.p_id,
          lat: query.lat ? query.lat : "",
          lon: query.lon ? query.lon : ""
        });
      }

      if (base.isReady) {
        _that.setData({
          zhima_zuth: base.is_auth
        });

        if (_that.data.locationAuth) {
          _that.httpGetData();
        }
      } else {
        base.readyCallBcak = function () {
          console.log("key 拿到了", base.isReady);
          console.log(base.is_auth);
          _that.setData({
            zhima_zuth: base.is_auth
          });

          if (_that.data.locationAuth) {
            _that.httpGetData();
          }
        };
      }
      var article = "<div>我是HTML代码</div>";
      var that = this;
      wxParse.wxParse("article", "html", article, that, 5);

      base.Event.listen(base.EventModel.EVENT_CHOOSE_SITE, site => {
        _that.setData({
          "packageInfo.tuijian_store.site_id": site.s_id,
          "packageInfo.tuijian_store.name": site.s_name
        });
      });
    },
    onReady() {
      // 页面加载完成
    },
    onShow() {
      // 页面显示
      if (!this.data.locationAuth) {
        this.checkLocationAuth();
      }
    },
    onHide() {
      // 页面隐藏
    },
    onUnload() {
      // 页面被关闭
      base.Event.remove(base.EventModel.EVENT_CHOOSE_SITE);
      this.stopGetPaySuccess();
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
    onShareAppMessage() {
      // 返回自定义分享信息
      return {
        title: "云马租车",
        desc: "快来跟我一起租车吧！",
        bgImgUrl: this.data.packageInfo.thumb[0],
        path: "packageA/ui/goodsDetail/goodsDetail?p_id=" + this.data.p_id
      };
    },

    /**
     * 判断是否有位置权限
     */
    checkLocationAuth() {
      let _that = this;
      my.getSetting({
        success: res => {
          _that.setData({
            locationAuth: res.authSetting["location"]
          });
          _that.getLocation();
        }
      });
    },

    /**
     * 获取定位
     */
    getLocation(showLoading = true) {
      console.log(showLoading);
      let _that = this;
      if (showLoading) {
        my.showLoading({
          content: "定位中..."
        });
      }
      my.getLocation({
        type: 1, //1:获取经纬度和详细到区县级别的逆地理编码数据。
        success(res) {
          if (showLoading) {
            my.hideLoading();
          }
          console.log("位置", res);
          _that.setData({
            lat: res.latitude,
            lon: res.longitude,
            city: res.city,
            province: res.province,
            locationAuth: true
          });

          _that.httpGetData();
        },
        fail(e) {
          my.hideLoading();
          _that.setData({
            city: "定位失败"
          });

          my.alert({
            title: "温馨提示",
            content:
              "我们需要您的位置信息，展示您附近的商品，请在设置中开启“地理位置”权限",
            buttonText: "重新授权",
            success: res => {
              my.openSetting();
            }
          });
        }
      });
    },

    /**
     * 点击
     */
    click(e) {
      let _that = this;
      let types = e.currentTarget.dataset.type;
      console.log(types);

      switch (types) {
        case "chooseStartDate":
          //选择开始时间
          let t = this;
          my.datePicker({
            format: "yyyy-MM-dd",
            startDate: t.data.nowDate,
            success: res => {
              t.setData({
                startDate: res.date
              });
            }
          });
          break;
        case "toHome":
          my.reLaunch({
            url: "/pages/index/index" // 页面路径。如果页面不为 tabbar 页面则路径后可以带参数。参数规则如下：路径与参数之间使用
          });
          break;
        case "callPhone":
          let phone = e.currentTarget.dataset.phone;
          my.makePhoneCall({
            number: phone // 电话号码
          });
          break;
        case "guideItemTitle":
          // let index = e.currentTarget.dataset.index;
          // this.setData({
          //   [`guideList[${index}].ext`]: !this.data.guideList[index].ext
          // });
          break;
        case "confirmClick":
          let token = my.getStorageSync({ key: http.KEY_TOKEN });
          if (
            token.data.mobile == "18888888888" ||
            !token.data.mobile ||
            token.data.mobile == "0"
          ) {
            my.navigateTo({
              url: "/pages/login/login"
            });
          } else if (token.data.is_certify !== 1) {
            my.navigateTo({
              url: "/pages/attestation/attestation"
            });
          } else if (
            this.data.packageInfo.needCertify === 1 &&
            token.data.ocr_certify !== 1
          ) {
            my.navigateTo({
              url: "/pages/photoVerification/photoVerification"
            });
          } else {
            this.setData({
              goodsSelectDialogShow: !this.data.goodsSelectDialogShow
            });
          }
          break;
        case "closeDialog":
          this.setData({
            goodsSelectDialogShow: false
          });
          break;
        case "confirmOrder":
          let _that = this;
          if (!_that.data.packageInfo.tuijian_store.site_id) {
            my.alert({
              title: "请选择站点",
              buttonText: "我知道了"
            });
            return;
          }
          if (_that.data.insurance == false && _that.data.insuranced == false) {
            my.confirm({
              title: "温馨提示",
              content: "为了您的安全及保障，建议您购买保险",
              confirmButtonText: "购买",
              cancelButtonText: "不需要",
              success: res => {
                if (res.confirm) {
                  this.setData({
                    insurance: true
                  });
                } else {
                  this.setData({
                    insuranced: true
                  });
                }
              }
            });
          } else {
            _that.httpConfirmOrder();
            _that.setData({
              goodsSelectDialogShow: false
            });
          }
          break;
      }
    },

    /**
     * 轮播图滑动
     */
    swiperChange(e) {
      this.setData({
        swiperIndex: e.detail.current + 1
      });
    },
    /**
     * 选择商品弹窗关闭
     */
    onPopupDialogClose() {
      this.setData({
        goodsSelectDialogShow: false
      });
    },

    //保险切换
    insuranceChange(e) {
      this.setData({
        insurance: e.detail.value
      });
    },
    /**
     * 加载数据
     */
    httpGetData() {
      let _that = this;
      base.http.httpPost({
        loading: "加载中...",
        url: "index/index/packageinfoNew",
        data: {
          p_id: _that.data.p_id,
          latitude: _that.data.lat,
          longitude: _that.data.lon,
          province: _that.data.province,
          city: _that.data.city
        },
        success(res) {
          let nowDate = base.util.getNowDate(new Date());
          let guideList = [];
          switch (res.data.ptype) {
            case 1:
              guideList.push(
                {
                  title: "租赁周期",
                  tip: "月租1期，最短租期1个月（不满1个月按1个月计算，所付租金不予退回）",
                },
                {
                  title: "租车流程",
                  tip:
                    "选择套餐，点击下方“信用租”→根据芝麻信用等级免押或支付押金→支付租金→到所选站点提车"
                },
                {
                  title: "续租",
                  tip:
                    "在您的订单详情中点击续租操作，支付费用后将在原来订单中增加租赁时限与续租信息。"
                },
                {
                  title: "退租",
                  tip:
                    "在您的订单详情中点击退租操作，将车带至站点，经站长验车后审核通过，完成退租。注意请保持车辆干净整洁。若有损坏需要赔偿相应金额。"
                }
              );
              break;
            case 3:
              guideList.push(
                {
                  title: "租赁周期",
                  tip: `月租${res.data.diffConfigVO.monthNum}期，未到期提前退租需支付违约金，租期满后车辆归骑手所有。最短租期1个月（不满1个月按1个月计算，所付租金不予退回）`,
                },
                {
                  title: "租车流程",
                  tip:
                    "选择套餐，点击下方“信用租”→根据芝麻信用等级免押或支付押金→支付租金→到所选站点提车"
                },
                {
                  title: "续租",
                  tip:
                    "在您的订单详情中点击续租操作，支付费用后将在原来订单中增加租赁时限与续租信息。"
                },
                {
                  title: "退租",
                  tip: `在您的订单详情中点击退租操作，将车带至站点，经站长验车后审核通过，完成退租。注意请保持车辆干净整洁。若有损坏需要赔偿相应金额。以租代售套餐提前退租将产生一次性违约金${res.data.diffConfigVO.diffAmount}元。`
                },
                {
                  title: "履约代扣",
                  tip:
                    "请确保第三方账户或绑定银行卡内余额充足，订单将会自动代扣完成支付；若未代扣成功，可打开小程序【我的-我的订单】查看进行中订单并点击【续租】完成支付操作"
                }
              );
              break;
            case 4:
              guideList.push(
                {
                  title: "租赁周期",
                  tip: `月租${res.data.diffConfigVO.monthNum}期，未到期提前退租需支付违约金。最短租期1个月（不满1个月按1个月计算，所付租金不予退回）`,
                },
                {
                  title: "租车流程",
                  tip:
                    "选择套餐，点击下方“信用租”→根据芝麻信用等级免押或支付押金→支付租金→到所选站点提车"
                },
                {
                  title: "续租",
                  tip:
                    "在您的订单详情中点击续租操作，支付费用后将在原来订单中增加租赁时限与续租信息。"
                },
                {
                  title: "退租",
                  tip: `在您的订单详情中点击退租操作，将车带至站点，经站长验车后审核通过，完成退租。注意请保持车辆干净整洁。若有损坏需要赔偿相应金额。以租代售套餐提前退租将产生一次性违约金${res.data.diffConfigVO.diffAmount}元。`
                },
                {
                  title: "履约代扣",
                  tip:
                    "请确保第三方账户或绑定银行卡内余额充足，订单将会自动代扣完成支付；若未代扣成功，可打开小程序【我的-我的订单】查看进行中订单并点击【续租】完成支付操作"
                }
              );
              break;
          }
          _that.setData({
            packageInfo: res.data,
            guideList,
            tuijian_sid: res.data.tuijian_store.site_id, //默认推荐的站点id
            nowDate: nowDate,
            startDate: nowDate
          });
        },
        fail(e) {
          my.alert({
            title: e.msg,
            buttonText: "我知道了"
          });
        }
      });
    },

    /**
     * 确认下单
     */
    httpConfirmOrder() {
      let _that = this;
      _that.setData({
        saveIng: true
      });
      base.http.httpPost({
        loading: "处理中...",
        url: "index/index/order",
        data: {
          dopost: "order",
          start_date: _that.data.startDate,
          sid: _that.data.packageInfo.tuijian_store.site_id,
          is_insure: _that.data.insurance ? 1 : 0,
          pid: _that.data.p_id
        },
        success(result) {
          if (result.data.orderStr) {
            //需要支付押金
            my.tradePay({
              orderStr: result.data.orderStr,
              success: res => {
                if (res.resultCode == 9000) {
                  my.showToast({
                    type: "success",
                    content: "押金支付成功",
                    duration: 3000
                  });
                  _that.startGetPaySuccess(result.data.order_id);
                } else {
                  my.confirm({
                    content: "您有一个订单未完成，点击查看",
                    confirmButtonText: "立即查看",
                    cancelButtonText: "暂不需要",
                    success: cres => {
                      _that.setData({
                        saveIng: false
                      });
                      if (cres.confirm) {
                        my.redirectTo({
                          url: "/packageB/ui/myOrder/myOrder"
                        });
                      }
                    }
                  });
                }
              }
            });
          } else if (result.data.flag == 1001) {
            //有相同的套餐 已支付押金 未支付订单的
            my.confirm({
              content: "您有一个相同待支付套餐，请前去处理！",
              confirmButtonText: "立即查看",
              success(cres) {
                _that.setData({
                  saveIng: false
                });
                if (cres.confirm) {
                  my.redirectTo({
                    url:
                      "/packageB/ui/orderDetail/orderDetail?id=" +
                      result.data.order_id
                  });
                }
              }
            });
          } else {
            //不需要支付押金
            _that.httpDepositCertificate(result.data.order_id);
          }
        },
        fail(e) {
          _that.setData({
            saveIng: false
          });
        }
      });
    },
    /**
     * 交押金认证
     */
    httpDepositCertificate(order_id) {
      let _that = this;
      let packageInfo = _that.data.packageInfo
      base.http.httpPost({
        url: "index/index/order",
        data: {
          dopost: "order_info",
          order_id: order_id
        },
        success(result) {
          result.data.p_id = _that.data.p_id;
          result.data.sid = packageInfo.tuijian_store.site_id;
          if (packageInfo.paymentIds.length === 1 && packageInfo.paymentIds.includes(4)) {
            base.http.httpPost({
              url: "user/index/bankCardList",
              success(res) {
                if (res.data.length) {
                  my.navigateTo({
                    url:
                      "/packageA/ui/myBankcard/myBankcard?orderData=" +
                      JSON.stringify(result.data)
                  });
                } else {
                  my.navigateTo({
                    url:
                      "/packageA/ui/withhold/withhold?orderData=" +
                      JSON.stringify(result.data)
                  });
                }
              }
            });
          } else {
            my.redirectTo({
              url:
                "/packageA/ui/confirmOrder/confirmOrder?data=" +
                JSON.stringify(result.data)
            });
          }
        }
      });
    },
    startGetPaySuccess(order_id) {
      let _that = this;
      payTimer = setInterval(() => {
        _that.httpGetPaySuccess(order_id);
      }, 1000);
    },
    stopGetPaySuccess() {
      if (payTimer) {
        clearInterval(payTimer);
      }
    },
    //获取支付成功状态
    httpGetPaySuccess(order_id) {
      let _that = this;
      base.http.httpPost({
        url: "index/index/getstatus",
        data: {
          order_id: order_id
        },
        success(result) {
          if (result.data.status == 1) {
            _that.setData({
              saveIng: false
            });
            _that.stopGetPaySuccess();
            _that.httpDepositCertificate(order_id);
          }
        }
      });
    }
  })
);
