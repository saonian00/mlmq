/**
 * 身份验证
 */
const App = getApp();
let base = App.constants;
var http = require("../../utils/http.js"); //网络请求

Page(
  base.pageCheck({
    data: {
      userCardDetail: {},
      cardData: {},
      index: 0,
      verifyCode: "",
      disclaimerChecked: true,
      // showPopup: true,

      areaAddress: '',
      areaList: [],
      provinceList: [{
        id: 110000,
        name: '北京',
        areas: [
          {
            code: 101,
            name: '朝阳区'
          },
          {
            code: 101,
            name: '丰台区'
          }
        ]
      }, {
        code: 2,
        name: '河北省',
        citys: [
          {
            code: 20,
            name: '石家庄市',
            areas: [{
              code: '201',
              name: '长安区'
            }]
          }
        ]
      }], // 省份列表
      cityList: [{
        code: 1,
        name: '北京',
        areas: [
          {
            code: 101,
            name: '朝阳区'
          },
          {
            code: 101,
            name: '丰台区'
          }
        ]
      }, {
        code: 2,
        name: '河北省',
        citys: [
          {
            code: 20,
            name: '石家庄市',
            areas: [{
              code: '201',
              name: '长安区'
            }]
          }
        ]
      }], // 市县列表
      districtList: [{
        code: 1,
        name: '北京',
        areas: [
          {
            code: 101,
            name: '朝阳区'
          },
          {
            code: 101,
            name: '丰台区'
          }
        ]
      }, {
        code: 2,
        name: '河北省',
        citys: [
          {
            code: 20,
            name: '石家庄市',
            areas: [{
              code: '201',
              name: '长安区'
            }]
          }
        ]
      }], // 区县列表
      areaIndex: [0, 0, 0], // 索引
    },

    // 初始化三级地区
    initArea(areaList) {
      var self = this;
      // 初始化数据
      let initIndex = self.data.areaIndex
      let provinceId, cityId, areaId, provinceName, cityName, areaName
      provinceId = areaList[initIndex[0]].id
      provinceName = areaList[initIndex[0]].name
      cityId = areaList[initIndex[0]].children[initIndex[1]].id
      cityName = areaList[initIndex[0]].children[initIndex[1]].name
      areaId = areaList[initIndex[0]].children[initIndex[1]].children[initIndex[2]].id
      areaName = areaList[initIndex[0]].children[initIndex[1]].children[initIndex[2]].name
      // 初始化列表数据
      self.setData({
        'form.province': provinceId,
        'form.city': cityId,
        'form.area': areaId,
        areaAddress: provinceName + cityName + areaName,
        provinceList: areaList,
        cityList: areaList[0].children,
        districtList: areaList[0].children[0].children
      })
    },
    // 选择地址——填充选择框——填充上传数据
    bindMultiPickerChange() {
      let self = this
      let initIndex = self.data.areaIndex
      let provinceId, cityId, areaId, provinceName, cityName, areaName
      provinceId = self.data.provinceList[initIndex[0]].id
      provinceName = self.data.provinceList[initIndex[0]].name
      cityId = self.data.provinceList[initIndex[0]].children[initIndex[1]].id
      cityName = self.data.provinceList[initIndex[0]].children[initIndex[1]].name
      areaId = self.data.provinceList[initIndex[0]].children[initIndex[1]].children[initIndex[2]].id
      areaName = self.data.provinceList[initIndex[0]].children[initIndex[1]].children[initIndex[2]].name
      self.setData({
        'form.province': provinceId,
        'form.city': cityId,
        'form.area': areaId,
        areaAddress: provinceName + cityName + areaName,
        showArea: false
      })
    },
    // 滑动地址
    bindMultiPickerColumnChange(e) {
      let self = this
      let newIndexArr = e.detail.value
      // 监听第一列
      if (newIndexArr[0] !== self.data.areaIndex[0]) {
        // 滑动第一列——初始化第二列和第三列的数据
         self.httpGetCertifyInfo(newIndexArr[0])
        let initArr = [newIndexArr[0], 0, 0]
        self.setData({
          areaIndex: initArr,
          cityList: self.data.provinceList[initArr[0]].children,
          districtList: self.data.provinceList[initArr[0]].children[0].children
        })
        return
      }
      // 监听第二列滑动
      if (newIndexArr[1] !== self.data.areaIndex[1]) {
        // 滑动第一列——初始化第二列和第三列的数据
        let initArr = [newIndexArr[0], newIndexArr[1], 0]
        self.setData({
          areaIndex: initArr,
          districtList: self.data.provinceList[initArr[0]].children[initArr[1]].children
        })
        return
      }
      // 监听第三列
      self.setData({
        areaIndex: newIndexArr
      })
    },
    showAreaPicker() {
      this.setData({
        showPopup: true,
      });
    },

    onLoad(query) {
      // 页面加载
      this.httpGetCertifyInfo(0);
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
     * 加载省市区
     */
    httpGetCertifyInfo(pid) {
      let _that = this;
      base.http.httpPost({
        url: "userAddress/getProvinces",
        data: { pid },
        success(res) {
          // _that.setData({
          //   realname: res.data.realname,
          //   cardNo: res.data.cardNo
          // });
          let areaList = res.data;
          areaList.map((item, index) => {
            item.name = item.cname;
            delete item.cname
          })
          console.log(areaList)
          _that.initArea(areaList)
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
