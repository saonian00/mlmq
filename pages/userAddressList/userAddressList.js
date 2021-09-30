/**
 * 身份验证
 */
const App = getApp();
let base = App.constants;

Page(
  base.pageCheck({
    data: {
      userAddList: [],//地址列表
      showPopup: false,
      switch: false,
      areaAddress: '',
      areaList: [],
      provinceList: [], // 省份列表
      cityList: [], // 市县列表
      districtList: [], // 区县列表
      areaIndex: [0, 0, 0], // 索引
    },
    onLoad(query) {
      // 页面加载
      this.httpGetList();
    },
    onReady() {
      // 页面加载完成
    },
    onShow() {
      // 页面显示
      this.httpGetList();
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

    // 初始化三级地区
    // initArea() {
    //   var self = this;
    //   var areaList = self.data.areaList;
    //   // 初始化数据
    //   let initIndex = self.data.areaIndex
    //   let provinceId, cityId, areaId, provinceName, cityName, areaName
    //   provinceId = areaList[initIndex[0]].id
    //   provinceName = areaList[initIndex[0]].name
    //   cityId = areaList[initIndex[0]].children[initIndex[1]].id
    //   cityName = areaList[initIndex[0]].children[initIndex[1]].name
    //   areaId = areaList[initIndex[0]].children[initIndex[1]].children[initIndex[2]].id
    //   areaName = areaList[initIndex[0]].children[initIndex[1]].children[initIndex[2]].name
    //   // 初始化列表数据
    //   self.setData({
    //     'form.province': provinceId,
    //     'form.city': cityId,
    //     'form.area': areaId,
    //     areaAddress: provinceName + cityName + areaName,
    //     provinceList: areaList.data,
    //     cityList: areaList.data[0].children,
    //     districtList: areaList.data[0].children[0].children
    //   })
    // },
    // 选择地址——填充选择框——填充上传数据
    bindMultiPickerChange() {
      let self = this
      let initIndex = self.data.areaIndex
      let provinceId, cityId, countyId, provinceName, cityName, countyName
      provinceId = self.data.provinceList[initIndex[0]].id
      provinceName = self.data.provinceList[initIndex[0]].name
      cityId = self.data.provinceList[initIndex[0]].children[initIndex[1]].id
      cityName = self.data.provinceList[initIndex[0]].children[initIndex[1]].name
      countyId = self.data.provinceList[initIndex[0]].children[initIndex[1]].children[initIndex[2]].id
      countyName = self.data.provinceList[initIndex[0]].children[initIndex[1]].children[initIndex[2]].name

      self.setData({
        'form.province': provinceId,
        'form.city': cityId,
        'form.county': countyId,
        areaAddress: provinceName + cityName + countyName,
        showPopup: false
      })
    },
    // 滑动地址
    bindMultiPickerColumnChange(e) {
      let self = this
      let newIndexArr = e.detail.value
      // 监听第一列
      if (newIndexArr[0] !== self.data.areaIndex[0]) {
        // 滑动第一列——初始化第二列和第三列的数据]
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
    //地区选择（打开）
    showAreaPicker() {
      this.setData({
        showPopup: true,
      });
    },
    //地区选择（关闭）
    onPopupClose() {
      this.setData({
        showPopup: false,
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
      let id = e.currentTarget.dataset.id;
      switch (types) {
        case "setDefault":
          my.confirm({
            content: '是否将此地址设置为默认地址?',
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            success: (result) => {
              if (result.confirm) {
                _that.setDefault(id);
              }
            },
          });
          break;
        case "editAddress":
          // _that.httpSave();
          break;
        case "delAddress":
          my.confirm({
            content: '是否删除此地址?',
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            success: (result) => {
              if (result.confirm) {
                _that.delAddress(id);
              }
            },
          });
          break;
      }
    },
    setDefault(id) {
      let _that = this;
      base.http.httpPost({
        loading: "处理中...",
        url: "userAddress/setDefault/" + id,
        success(res) {
          my.showToast({
            content: res.msg,
          })
          _that.httpGetList()
        },
        fail(res) {
          my.showToast({
            content: res.msg,
          })
        }
      })
    },
    delAddress(id) {
      let _that = this;
      base.http.httpPost({
        loading: "处理中...",
        url: "userAddress/del/" + id,
        success(res) {
          my.showToast({
            content: res.msg,
          })
          _that.httpGetList()
        },
        fail(res) {
          my.showToast({
            content: res.msg,
          })
        }
      })
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
     * 默认地址切换
     *
     * @param {*} e
     */
    switchChange(e) {
      this.setData({
        switch: e.detail.value,
      });
    },
    /**
     * 加载收货地址列表
     */
    httpGetList() {
      let _that = this;
      base.http.httpPost({
        url: "userAddress/getList",
        success(result) {
          _that.setData({
            userAddList: result.data,
          })
        }
      });
    },
    /**
     * 保存数据
     */
    httpSave() {
      let _that = this;
      let { id, receviceName, receviceTel, form, addressDetail, isDefault } = _that.data
      if (receviceTel && !(/^1[3456789]\d{9}$/.test(receviceTel))) {
        my.showToast({
          type: 'fail',
          content: '手机号码有误，请重填！'
        })
      } else if (receviceName && form && addressDetail) {
        _that.setData({
          saveIng: true
        });
        base.http.httpPost({
          loading: "处理中...",
          url: "userAddress/save",
          data: {
            id,
            receviceName,
            receviceTel,
            province: form.province,
            city: form.city,
            county: form.county,
            addressDetail,
            isDefault: isDefault ? 1 : 0
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
        my.showToast({
          type: 'fail',
          content: '请填写完整地址信息！'
        })
      }
    }
  })
);
