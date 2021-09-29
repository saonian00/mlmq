/**
 * 订单详情
 */
let App = getApp();
let base = App.constants;
Page(
  base.pageCheck({
    data: {
      id: "",
      insure: ""
    },
    onLoad(query) {
      // 页面加载
      if (query.id) {
        this.setData({
          id: query.id
        });
      }
      base.Event.listen(base.EventModel.EVENT_CHOOSE_SITE, site => {
        let _that = this;
        my.confirm({
          content: `您已经选择的退车站点为：${site.name}`,
          confirmButtonText: "确定退租",
          cancelButtonText: "我再想想",
          success: res => {
            if (res.confirm) {
              _that.httpApplyTui(site.id);
            }
          }
        });
        _that.setData({
          "packageInfo.tuijian_store.site_id": site.id,
          "packageInfo.tuijian_store.name": site.name
        });
      });
    },
    onReady() {
      // 页面加载完成
    },
    onShow() {
      // 页面显示
      this.httpGetData();
    },
    onHide() {
      // 页面隐藏
    },
    onUnload() {
      // 页面被关闭
      base.Event.remove(base.EventModel.EVENT_CHOOSE_SITE);
    },
    onTitleClick() {
      // 标题被点击
    },
    onPullDownRefresh() {
      // 页面被下拉
      this.httpGetData();
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
      switch (types) {
        case "callPhone":
          let phone = e.currentTarget.dataset.phone;
          my.makePhoneCall({
            number: phone // 电话号码
          });
          break;
        case "antSignUrl":
          //继续签约
          _that.antSignUrl()
          break;
        case "nav":
          my.openLocation({
            longitude: _that.data.orderDetail.site.coordinate.split(",")[0], // 经度
            latitude: _that.data.orderDetail.site.coordinate.split(",")[1], // 纬度
            name: _that.data.orderDetail.site.name, // 位置名称
            address: _that.data.orderDetail.site.address // 地址的详细说明
          });
          break;
        case "tui":
          //申请退租
          base.http.httpPost({
            loading: "加载中...",
            url: "index/index/order",
            data: {
              dopost: "penalty",
              order_id: _that.data.id
            },
            success(res) {
              if (res.data) {
                let penaltyDetail = {};
                penaltyDetail.penalty = res.data;
                penaltyDetail.is_penalty_pay = 1;
                penaltyDetail.order_id = _that.data.id;
                my.confirm({
                  content: "以租代售合约提早结束将产生违约金，请谨慎操作！",
                  confirmButtonText: "继续使用",
                  cancelButtonText: "我要退租",
                  success: res => {
                    if (!res.confirm) {
                      my.navigateTo({
                        url:
                          "/packageA/ui/confirmOrder/confirmOrder?data=" +
                          JSON.stringify(penaltyDetail)
                      });
                    }
                  }
                });
              } else {
                if (
                  _that.data.orderDetail.needRepair === 1 &&
                  _that.data.orderDetail.repairType === 2
                ) {
                  if (_that.data.packageInfo) {
                    my.confirm({
                      content: `您已经选择的退车站点为：${_that.data.packageInfo.tuijian_store.name}`,
                      confirmButtonText: "确定退租",
                      cancelButtonText: "我再想想",
                      success: res => {
                        if (res.confirm) {
                          _that.httpApplyTui(
                            _that.data.packageInfo.tuijian_store.site_id
                          );
                        }
                      }
                    });
                  } else {
                    my.confirm({
                      content: "请先选择退车点！",
                      confirmButtonText: "去选择",
                      cancelButtonText: "继续使用",
                      success: res => {
                        if (res.confirm) {
                          my.navigateTo({
                            url:
                              "/packageB/ui/chooseSite/chooseSite?type=choose&p_id=" +
                              _that.data.orderDetail.pid
                          });
                        }
                      }
                    });
                  }
                } else {
                  my.confirm({
                    content: "是否确认退租？",
                    confirmButtonText: "继续使用",
                    cancelButtonText: "我要退租",
                    success: res => {
                      if (!res.confirm) {
                        _that.httpApplyTui();
                      }
                    }
                  });
                }
              }
            }
          });
          break;
        case "xuzu":
          //续租
          console.log(_that.data.insure);
          if (_that.data.insure == "0") {
            my.confirm({
              title: "温馨提示",
              content: "为了您的安全及保障，建议您购买保险",
              confirmButtonText: "购买",
              cancelButtonText: "不需要",
              success: res => {
                if (res.confirm) {
                  this.setData({
                    insure: "1"
                  });
                  my.confirm({
                    content: "是否确认续租？",
                    confirmButtonText: "我要续租",
                    cancelButtonText: "暂不续租",
                    success: res => {
                      if (res.confirm) {
                        _that.httpXuzu();
                      }
                    }
                  });
                } else {
                  this.setData({
                    insure: "0"
                  });
                  my.confirm({
                    content: "是否确认续租？",
                    confirmButtonText: "我要续租",
                    cancelButtonText: "暂不续租",
                    success: res => {
                      if (res.confirm) {
                        _that.httpXuzu();
                      }
                    }
                  });
                }
              }
            });
          } else {
            this.setData({
              insure: "0"
            });
            my.confirm({
              content: "是否确认续租？",
              confirmButtonText: "我要续租",
              cancelButtonText: "暂不续租",
              success: res => {
                if (res.confirm) {
                  _that.httpXuzu();
                }
              }
            });
          }
          break;
        case "buyInsure":
          //购买保险
          let insure = e.currentTarget.dataset.insure;
          my.confirm({
            content: `购买车辆盗抢险（金额：${insure}元）`,
            confirmButtonText: "购买",
            cancelButtonText: "暂不购买",
            success: res => {
              if (res.confirm) {
                base.http.httpPost({
                  loading: "处理中...",
                  url: "index/index/order",
                  data: {
                    dopost: "insure",
                    order_id: _that.data.id
                  },
                  success(result) {
                    my.tradePay({
                      tradeNO: result.data.trade_no,
                      success(payRes) {
                        console.log(payRes, "payRes");
                        if (payRes.resultCode == 9000) {
                          _that.httpGetData();
                        } else {
                          my.alert({
                            content: "支付失败！"
                          });
                        }
                      },
                      fail: res => {
                        my.alert({
                          content: JSON.stringify(res)
                        });
                      }
                    });
                  }
                });
              }
            }
          });
          break;
        case "contractShow":
          my.downloadFile({
            url: _that.data.orderDetail.contractUrl,
            success({ apFilePath }) {
              console.log(apFilePath);
              my.hideLoading();
              my.openDocument({
                filePath: apFilePath,
                fileType: "pdf",
                success: res => {
                  console.log("open document success");
                }
              });
            }
          });
          break;
        case "refund":
          //申请退款
          let refundRate = e.currentTarget.dataset.refundRate;
          my.confirm({
            title: "退款提示",
            content: `申请退款将收取${refundRate}手续费，是否确定退款？`,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            success: res => {
              if (res.confirm) {
                base.http.httpPost({
                  loading: "处理中...",
                  url: "index/index/order",
                  data: {
                    dopost: "refund",
                    order_id: _that.data.id
                  },
                  success(result) {
                    my.showToast({
                      content: result.msg,
                      success: () => {
                        _that.httpGetData();
                      }
                    });
                  }
                });
              }
            }
          });
          break;
        case "payDiff":
          //支付滞纳金
          base.http.httpPost({
            loading: "处理中...",
            url: "index/index/order",
            data: {
              dopost: "diff",
              order_id: _that.data.id
            },
            success(result) {
              result.data.is_diff_pay = 1;
              result.data.order_id = _that.data.id;
              console.log(JSON.stringify(result.data));
              my.navigateTo({
                url:
                  "/packageA/ui/confirmOrder/confirmOrder?data=" +
                  JSON.stringify(result.data)
              });
            }
          });
          break;
        case "payRepair":
          //支付滞纳金
          base.http.httpPost({
            loading: "处理中...",
            url: "index/index/order",
            data: {
              dopost: "repair",
              order_id: _that.data.id
            },
            success(result) {
              result.data.is_repair_pay = 1;
              result.data.order_id = _that.data.id;
              console.log(JSON.stringify(result.data));
              my.navigateTo({
                url:
                  "/packageA/ui/confirmOrder/confirmOrder?data=" +
                  JSON.stringify(result.data)
              });
            }
          });
          break;
        case "cancel":
        case "continue":
          //取消订单和继续支付
          let dopost = "";
          if (types == "cancel") {
            dopost = "cancel_order";
          } else if (types == "continue") {
            dopost = "order_pay";
          }
          base.http.httpPost({
            loading: "处理中...",
            url: "index/index/order",
            data: {
              dopost: dopost,
              order_id: _that.data.id
            },
            success(result) {
              if (types == "cancel") {
                //取消订单
                _that.httpGetData();
              } else if (types == "continue") {
                if (result.data.orderStr) {
                  //支付押金
                  _that.payDeposit(result.data.orderStr);
                } else {
                  _that.orderSignInfo();
                }
              }
            }
          });
          break;
      }
    },
    /**
     * 是否代扣授权
     */
    orderSignInfo() {
      let _that = this;
      base.http.httpPost({
        url: "user/index/orderSignInfoNew",
        data: {
          order_id: _that.data.id
        },
        success(result) {
          //payTypeIds长度判断支付方式，大于1表示有多种支付方式并没有在去支付中选择
          if (result.data.payTypeIds.length > 1) {
            base.http.httpPost({
              loading: "处理中...",
              url: "index/index/order",
              data: {
                dopost: 'order_info',
                order_id: _that.data.id
              },
              success(res) {
                console.log(res)
                my.redirectTo({
                  url:
                    "/packageA/ui/confirmOrder/confirmOrder?data=" +
                    JSON.stringify(res.data)
                });
              }
            })
            //payTypeIds等于4，指银行卡代扣
          } else if (result.data.payTypeIds.includes(4)) {
            if (result.data.contractSign) {
              _that.payOrder();
            } else {
              base.http.httpPost({
                url: "user/index/bankCardList",
                success(res) {
                  if (res.data.length) {
                    my.navigateTo({
                      url:
                        "/packageA/ui/myBankcard/myBankcard?orderId=" +
                        _that.data.id
                    });
                  } else {
                    my.navigateTo({
                      url:
                        "/packageA/ui/withhold/withhold?orderId=" + _that.data.id
                    });
                  }
                }
              });
            }
            //payTypeIds等于6，指智能合同
          } else if (result.data.payTypeIds.includes(6) && result.data.deductType === 2) {
            //payType：1 订单支付 2 保险支付。用于判断后付套餐是否单付保险
            if (_that.data.orderDetail.payType === 2) {
              base.http.httpPost({
                loading: "处理中...",
                url: "index/index/order",
                data: {
                  dopost: "insure",
                  order_id: _that.data.id
                },
                success(result) {
                  my.tradePay({
                    tradeNO: result.data.trade_no,
                    success(payRes) {
                      if (payRes.resultCode == 9000) {
                        _that.antSignUrl()
                      } else {
                        my.alert({
                          content: "支付失败！"
                        });
                      }
                    },
                    fail: res => {
                      my.alert({
                        content: JSON.stringify(res)
                      });
                    }
                  });
                }
              });
            } else {
              _that.antSignUrl()
            }
          } else {
            _that.payOrder();
          }
        }
      });
    },
    /**
     * 支付押金
     */
    payDeposit(orderStr) {
      let _that = this;
      my.tradePay({
        orderStr: orderStr,
        success(payRes) {
          if (payRes.resultCode == 9000) {
            _that.setData({
              saveIng: false
            });
            my.confirm({
              content: "冻结成功",
              confirmButtonText: "支付订单",
              success(cres) {
                _that.httpGetData();
                if (cres.confirm) {
                  _that.orderSignInfo();
                }
              }
            });
          }
        },
        fail: res => {
          my.alert({
            content: JSON.stringify(res)
          });
        }
      });
    },
    /**
   * 跳转智能合同
   */
    antSignUrl() {
      my.showLoading({
        content: "加载中..."
      });
      base.http.httpPost({
        url: "index/index/antSignUrlNew",
        data: {
          order_id: this.data.id,
        },
        success(res) {
          my.hideLoading()
          function getSignUrl(aliSchema) {
            if (!aliSchema) {
              return "";
            }
            const querys = aliSchema.split("?")[1].split("&");
            const signUrlKeyValue = querys
              .find(item => item.includes("query="))
              .replace("query=", "");
            const encodedSignUrl = decodeURIComponent(
              signUrlKeyValue
            ).replace("signUrl=", "");
            return encodedSignUrl;
          }
          let signUrl = getSignUrl(res.data)
          my.navigateToMiniProgram({
            appId: "2021001152620480",
            path: `pages/signH5/index?signUrl=${signUrl}`,
            success: result => {
              console.log(JSON.stringify(result));
              my.hideLoading();
              this.httpGetData();
            },
            fail: result => {
              console.log(JSON.stringify(result));
              my.hideLoading();
            }
          });
        }
      })
    },
    /**
     * 支付订单
     */
    payOrder() {
      let _that = this;
      base.pay({
        tradeNO: _that.data.orderDetail.trade_no,
        success(payRes) {
          _that.setData({
            saveIng: false
          });
          _that.httpGetData();
        },
        fail(e) {
          _that.setData({
            saveIng: false
          });
        }
      });
    },
    /**
     * 加载订单
     */
    httpGetData() {
      let _that = this;
      base.http.httpPost({
        loading: "加载中...",
        url: "index/index/order",
        data: {
          dopost: "info",
          order_id: _that.data.id
        },
        complete() {
          my.stopPullDownRefresh();
        },
        success(res) {
          _that.setData({
            orderDetail: res.data,
            insure: res.data.insure
          });
        }
      });
    },
    /**
     * 申请退租
     */
    httpApplyTui(sid) {
      let _that = this;
      base.http.httpPost({
        loading: "处理中...",
        url: "index/index/order",
        data: {
          dopost: "tuizu",
          order_id: _that.data.id,
          site_type: !!_that.data.orderDetail.repairType
            ? _that.data.orderDetail.repairType
            : null,
          site_id: !!sid ? sid : null
        },
        success(res) {
          _that.httpGetData();
        }
      });
    },
    /**
     * 续租
     */
    httpXuzu() {
      let _that = this;
      base.http.httpPost({
        loading: "处理中...",
        url: "index/index/order",
        data: {
          dopost: "xuzu",
          order_id: _that.data.id,
          is_insure: _that.data.insure
        },
        success(res) {
          res.data.is_xuzu = 1;
          res.data.order_id = _that.data.id;
          console.log(JSON.stringify(res.data));
          my.navigateTo({
            url:
              "/packageA/ui/confirmOrder/confirmOrder?data=" +
              JSON.stringify(res.data)
          });
        }
      });
    }
  })
);
