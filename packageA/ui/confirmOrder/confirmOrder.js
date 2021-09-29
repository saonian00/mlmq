/**
 * 确认订单
 */
let App = getApp();
let base = App.constants;
Page(
  base.pageCheck({
    data: {
      disclaimerChecked: false,
    },
    onLoad(query) {
      // 页面加载
      if (query.data) {
        this.setData({
          orderData: JSON.parse(query.data)
        });
        if (this.data.orderData.payments) {
          this.setData({
            objectArray: this.data.orderData.payments,
            arrIndex: 0
          });
        }
        if (this.data.orderData.is_xuzu == 1) {
          my.setNavigationBar({
            title: "续租信息确认"
          });
        }
        if (this.data.orderData.is_diff_pay == 1) {
          my.setNavigationBar({
            title: "支付滞纳金"
          });
          this.setData({
            disclaimerChecked: true
          });
        }
        if (this.data.orderData.is_penalty_pay == 1) {
          my.setNavigationBar({
            title: "支付违约金"
          });
          this.setData({
            disclaimerChecked: true
          });
        }
        if (this.data.orderData.is_repair_pay == 1) {
          my.setNavigationBar({
            title: "支付检修金"
          });
          this.setData({
            disclaimerChecked: true
          });
        }
      }
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
    bindObjPickerChange(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value);
      this.setData({
        arrIndex: e.detail.value,
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
        case "confirmClick":
          if (_that.data.orderData.is_xuzu == 1) {
            _that.httpXuzuPay();
          } else if (_that.data.orderData.is_diff_pay == 1) {
            _that.httpDiffPay();
          } else if (_that.data.orderData.is_penalty_pay == 1) {
            _that.httpPenaltyPay();
          } else if (_that.data.orderData.is_repair_pay == 1) {
            _that.httpRepairPay();
          } else {
            _that.httpPay();
          }
          break;
        case "disclaimer":
          my.navigateTo({
            url: "/pages/webView/webView?url=" + base.termsUrl + "?id=t1"
          });
          break;
        case "leaseContract":
          base.http.httpPost({
            url: "index/index/contractInfo",
            data: {
              order_id: _that.data.orderData.order_id
            },
            success(res) {
              console.log(res);
              let url =
                "?id=leaseContract" +
                _that.data.orderData.contractType +
                "&orderData=" +
                JSON.stringify(res.data);
              my.navigateTo({
                url:
                  "/pages/webView/webView?url=" +
                  base.termsUrl +
                  encodeURIComponent(url)
              });
            }
          });
          break;
      }
    },

    /**
     * 免责声明切换
     */
    disclaimerChange(e) {
      console.log(e);
      this.setData({
        disclaimerChecked: e.detail.value
      });
    },

    //保险切换
    insuranceChange(e) {
      this.setData({
        "orderData.insure.is_insure": e.detail.value ? 1 : 0
      });
    },

    /**
     * 确认下单
     */
    httpPay() {
      let _that = this;
      let data = _that.data
      _that.setData({
        saveIng: true
      });
      if (data.objectArray.length > 1 && data.objectArray[data.arrIndex].id === 4) {
        data.orderData.payments = []
        data.orderData.payments.push(data.objectArray[data.arrIndex])
        base.http.httpPost({
          url: "user/index/bankCardList",
          success(res) {
            _that.setData({
              saveIng: false
            });
            if (res.data.length) {
              my.navigateTo({
                url:
                  "/packageA/ui/myBankcard/myBankcard?orderData=" +
                  JSON.stringify(data.orderData)
              });
            } else {
              my.navigateTo({
                url:
                  "/packageA/ui/withhold/withhold?orderData=" +
                  JSON.stringify(data.orderData)
              });
            }
          }
        });
      } else if (data.objectArray.length > 1 && data.objectArray[data.arrIndex].id === 6) {
        data.orderData.payments = []
        data.orderData.payments.push(data.objectArray[data.arrIndex])
        if (data.orderData.deductType === 1) {
          _that.setData({
            saveIng: false
          });
          base.pay({
            tradeNO: data.orderData.trade_no,
            success(payRes) {
              _that.setData({
                saveIng: false
              });
              _that.httpAntSignUrl()
            },
            fail(e) {
              _that.setData({
                saveIng: false
              });
            }
          })
        } else {
          if (data.orderData.insure.is_insure === 1) {
            _that.setData({
              saveIng: false
            });
            base.pay({
              tradeNO: data.orderData.trade_no,
              success(payRes) {
                _that.setData({
                  saveIng: false
                });
                _that.httpAntSignUrl()
              },
              fail(e) {
                _that.setData({
                  saveIng: false
                });
              }
            })
          } else {
            _that.httpAntSignUrl()
          }
        }
      } else {
        if (data.objectArray.length === 1 && data.orderData.deductType === 1) {
          _that.setData({
            saveIng: false
          });
          base.pay({
            tradeNO: data.orderData.trade_no,
            success(payRes) {
              _that.setData({
                saveIng: false
              });
              _that.httpAntSignUrl()
            },
            fail(e) {
              _that.setData({
                saveIng: false
              });
            }
          });
        } else if (data.objectArray.length === 1 && data.orderData.deductType === 2) {
          if (data.orderData.insure.is_insure === 1) {
            _that.setData({
              saveIng: false
            });
            base.pay({
              tradeNO: data.orderData.trade_no,
              success(payRes) {
                _that.setData({
                  saveIng: false
                });
                _that.httpAntSignUrl()
              },
              fail(e) {
                _that.setData({
                  saveIng: false
                });
              }
            })
          } else {
            _that.httpAntSignUrl()
          }
        } else {
          _that.setData({
            saveIng: false
          });
          base.pay({
            tradeNO: data.orderData.trade_no,
            success(payRes) {
              _that.setData({
                saveIng: false
              });
              my.redirectTo({
                url:
                  "/packageB/ui/orderDetail/orderDetail?id=" +
                  _that.data.orderData.order_id
              });
            },
            fail(e) {
              _that.setData({
                saveIng: false
              });
            }
          });
        }
      }
    },
    /**
     * 智能合同
     */
    httpAntSignUrl() {
      let _that = this
      my.showLoading({
        content: "加载中..."
      });
      _that.setData({
        saveIng: false
      });
      base.http.httpPost({
        url: "index/index/antSignUrlNew",
        data: {
          order_id: _that.data.orderData.order_id
        },
        success(resultAnt) {
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
          let signUrl = getSignUrl(resultAnt.data)
          my.navigateToMiniProgram({
            appId: "2021001152620480",
            path: `pages/signH5/index?signUrl=${signUrl}`,
            success: resultNavigate => {
              console.log(JSON.stringify(resultNavigate));
              my.hideLoading();
            },
            fail: resultNavigate => {
              console.log(JSON.stringify(resultNavigate));
              my.hideLoading();
            }
          });
        }
      })
    },

    /**
     * 续租
     */
    httpXuzuPay() {
      let _that = this;
      base.http.httpPost({
        loading: "处理中...",
        url: "index/index/order",
        data: {
          dopost: "xuzu",
          flag: "pay",
          order_id: _that.data.orderData.order_id,
          is_insure:
            _that.data.orderData.insure.is_insure == "1" ||
              _that.data.orderData.insure.is_insure == 1
              ? 1
              : 0
        },
        success(res) {
          base.pay({
            tradeNO: res.data.trade_no,
            success(payRes) {
              _that.setData({
                saveIng: false
              });
              my.navigateBack({});
            },
            fail(e) {
              _that.setData({
                saveIng: false
              });
            }
          });
        }
      });
    },

    /**
     * 滞纳金支付
     */
    httpDiffPay() {
      let _that = this;
      base.http.httpPost({
        loading: "处理中...",
        url: "index/index/order",
        data: {
          dopost: "diff",
          flag: "pay",
          order_id: _that.data.orderData.order_id
        },
        success(res) {
          base.pay({
            tradeNO: res.data.trade_no,
            success(payRes) {
              _that.setData({
                saveIng: false
              });
              my.navigateBack({});
            },
            fail(e) {
              _that.setData({
                saveIng: false
              });
            }
          });
        }
      });
    },
    /**
     * 违约金支付
     */
    httpPenaltyPay() {
      let _that = this;
      base.http.httpPost({
        loading: "处理中...",
        url: "index/index/order",
        data: {
          dopost: "penalty",
          flag: "pay",
          order_id: _that.data.orderData.order_id
        },
        success(res) {
          base.pay({
            tradeNO: res.data.trade_no,
            success(payRes) {
              _that.setData({
                saveIng: false
              });
              my.navigateBack({});
            },
            fail(e) {
              _that.setData({
                saveIng: false
              });
            }
          });
        }
      });
    },
    /**
     * 检修金支付
     */
    httpRepairPay() {
      let _that = this;
      base.http.httpPost({
        loading: "处理中...",
        url: "index/index/order",
        data: {
          dopost: "repair",
          flag: "pay",
          order_id: _that.data.orderData.order_id
        },
        success(res) {
          base.pay({
            tradeNO: res.data.trade_no,
            success(payRes) {
              _that.setData({
                saveIng: false
              });
              my.navigateBack({});
            },
            fail(e) {
              _that.setData({
                saveIng: false
              });
            }
          });
        }
      });
    }
  })
);
