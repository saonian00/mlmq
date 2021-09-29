/**
 * 身份验证
 */
const App = getApp();
let base = App.constants;
var http = require("../../../utils/http.js"); //网络请求

Page(
  base.pageCheck({
    data: {
      userCardDetail: {},
      cardData: {},
      index: 0,
      verifyCode: "",
      disclaimerChecked: true
    },
    onLoad(query) {
      // 页面加载
      this.httpGetCertifyInfo();
      this.httpGetBankList();
      if (query.id) {
        this.setData({
          id: query.id
        });
        this.httpGetList(query.id);
      }
      if (query.orderData) {
        this.setData({
          orderData: JSON.parse(query.orderData)
        });
      }
      if (query.orderId) {
        this.setData({
          orderId: query.orderId
        });
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
    //验证码发送
    onSend() {
      let _that = this;
      base.http.httpPost({
        url: "user/index/cardPreSign",
        data: {
          order_id: _that.data.orderData
            ? _that.data.orderData.order_id
            : _that.data.orderId,
          user_name: _that.data.realname,
          card_no: _that.data.cardNo,
          bank_card_no: _that.data.bankCardNo,
          mobile: _that.data.cardMobile
        },
        success(res) {
          console.log(res.data);
          _that.setData({
            unique_code: res.data
          });
          my.showToast({
            content: res.msg,
            duration: 3000
          });
        }
      });
    },
    //验证码填写
    onInput(e) {
      this.setData({
        verifyCode: e.detail.value
      });
    },
    //清楚验证码
    onClear() {
      this.setData({
        verifyCode: ""
      });
    },
    disclaimerChange(e) {
      console.log(e);
      this.setData({
        disclaimerChecked: e.detail.value
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
          _that.httpSave();
          break;
        case "disclaimer":
          my.navigateTo({
            url:
              "/pages/webView/webView?url=" +
              base.termsUrl +
              "?id=" +
              _that.data.bankId
          });
          break;
      }
    },
    /**
     * 输入处理
     *
     * @param {*} e
     */
    bindPickerChange(e) {
      this.setData({
        index: e.detail.value,
        bankId: this.data.bankList[e.detail.value].bankId
      });
    },
    /**
     * 输入处理
     *
     * @param {*} e
     */
    inputChange(e) {
      let _that = this;
      let types = e.currentTarget.dataset.type;
      _that.setData({
        [`${types}`]: e.detail.value
      });
    },
    /**
     * 加载银行卡详情
     */
    httpGetList(card_id) {
      let _that = this;
      base.http.httpPost({
        url: "user/index/userCardDetail",
        data: { card_id },
        success(res) {
          _that.setData({
            bankCardNo: res.data.cardNo,
            cardMobile: res.data.cardMobile,
            bankId: res.data.bankId,
            bankName: res.data.bankName,
            index: _that.data.bankNameList.indexOf(res.data.bankName)
          });
        }
      });
    },
    /**
     * 加载用户信息
     */
    httpGetCertifyInfo() {
      let _that = this;
      base.http.httpPost({
        url: "user/index/getCertifyInfo",
        success(res) {
          _that.setData({
            realname: res.data.realname,
            cardNo: res.data.cardNo
          });
        }
      });
    },
    /**
     * 加载银行列表
     */
    httpGetBankList() {
      let _that = this;
      base.http.httpPost({
        url: "user/index/bankList",
        success(res) {
          let bankNameList = [];
          let bankList = res.data;
          bankList.map((item, index) => {
            bankNameList.push(item.bankName);
          });

          _that.setData({
            bankList,
            bankNameList,
            bankId: bankList[_that.data.index].bankId
          });
        }
      });
    },
    /**
     * 保存数据
     */
    httpSave() {
      let _that = this;
      _that.setData({
        saveIng: true
      });
      if (!_that.data.orderData && !_that.data.orderId) {
        base.http.httpPost({
          loading: "处理中...",
          url: "user/index/saveUserCard",
          data: {
            card_id: _that.data.id,
            card_no: _that.data.bankCardNo,
            card_mobile: _that.data.cardMobile
          },
          success(res) {
            my.alert({
              title: res.msg,
              buttonText: "我知道了",
              success: () => {
                setTimeout(() => {
                  my.navigateBack({});
                }, 1);
              }
            });
          },
          fail(res) {
            my.alert({
              title: res.msg,
              buttonText: "我知道了"
            });
            _that.setData({
              saveIng: false
            });
          }
        });
      } else {
        base.http.httpPost({
          loading: "处理中...",
          url: "user/index/cardSign",
          data: {
            card_id: _that.data.id,
            order_id: _that.data.orderData
              ? _that.data.orderData.order_id
              : _that.data.orderId,
            msg_code: _that.data.verifyCode,
            unique_code: _that.data.unique_code,
            card_no: _that.data.bankCardNo,
            card_mobile: _that.data.cardMobile
          },
          success(res) {
            if (_that.data.orderData) {
              my.redirectTo({
                url:
                  "/packageA/ui/confirmOrder/confirmOrder?data=" +
                  JSON.stringify(_that.data.orderData)
              });
            } else if (_that.data.orderId) {
              my.redirectTo({
                url:
                  "/packageB/ui/orderDetail/orderDetail?id=" +
                  _that.data.orderId
              });
            }
          },
          fail(res) {
            my.alert({
              title: res.msg,
              buttonText: "我知道了"
            });
            _that.setData({
              saveIng: false
            });
          }
        });
      }
    }
  })
);
