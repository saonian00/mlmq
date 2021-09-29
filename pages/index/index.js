/**
 * 首页
 */
let App = getApp();
let base = App.constants;
var http = require("../../utils/http.js"); //网络请求
Page(
  base.pageCheck({
    data: {
      tabs: [],
      activeTab: 0,
    },


    onLoad(query) {
      // 页面加载
      this.httpGetIndeData();
      this.httpGetIndeData1();
      this.httpGetIndeData2();
      this.httpGetIndeData3();
      this.httpGetIndeData4();
    },
    onReady() {
      // 页面加载完成
      this.mapCtx = my.createMapContext("mapView");
      this.mapCtx.gestureEnable({ isGestureEnable: 0 });
    },
    onShow() {
      // 页面显示
      this.setData({
        zhima_zuth: base.is_auth
      });
      if (this.data.isReady && !this.data.locationAuth) {
        this.checkLocationAuth();
      }
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
      this.httpGetIndeData();
    },
    onReachBottom() {
      // 页面被拉到底部
    },
    onShareAppMessage() {
      // 返回自定义分享信息
      return {
        title: "云马租车",
        desc: "快来跟我一起租车吧！",
        bgImgUrl: "/res/img_login.png",
        path: "pages/index/index"
      };
    },

    handleTabClick({ index, tabsName }) {
      // console.log(index, tabsName)
      this.setData({
        [tabsName]: index,
      });

      this.getListByCatCode(this.data.tabs[index].catCode)
    },
    /**
     * 点击
     */
    click(e) {
      let _that = this;
      let types = e.currentTarget.dataset.type;
      console.log(types);
      switch (types) {
        case "getLocation":
          _that.getLocation();
          break;
        case "callPhone":
          my.makePhoneCall({
            number: _that.data.indexData.near.tel + "" // 电话号码
          });
          break;
        case "nav":
          my.openLocation({
            longitude: _that.data.indexData.near.lon, // 经度
            latitude: _that.data.indexData.near.lat, // 纬度
            name: _that.data.indexData.near.name, // 位置名称
            address: _that.data.indexData.near.address // 地址的详细说明
          });
          break;
        case "openMap":
          // my.openLocation({
          //     longitude: 120,
          //     latitude: 30,
          //     name: '要去的名字',
          //     address: '要去的描述',
          // })
          break;
        case "getScan":
          let token = my.getStorageSync({ key: http.KEY_TOKEN });
          if (
            token.data.mobile == "18888888888" ||
            !token.data.mobile ||
            token.data.mobile == "0"
          ) {
            my.navigateTo({
              url: "/pages/login/login"
            });
          } else if (token.data.is_certify != 1) {
            my.navigateTo({
              url: "/pages/attestation/attestation"
            });
          } else {
            my.scan({
              success(res) {
                let code = res.code;
                my.hideLoading()
                if (code === "ymzc/mt/replacementUser") {
                  my.navigateTo({
                    url: "/pages/replacementUser/replacementUser"
                  });
                } else if (
                  code.indexOf("packageA/ui/goodsDetail/goodsDetail" !== -1)
                ) {
                  let p_id = code.slice(code.lastIndexOf("%3D") + 3);
                  my.navigateTo({
                    url: "/packageA/ui/goodsDetail/goodsDetail?p_id=" + p_id
                  });
                }
              }
            });
          }
          break;
        case "goodsItem":
          let pid = e.currentTarget.dataset.pid;
          my.navigateTo({
            url:
              "/packageA/ui/goodsDetail/goodsDetail?p_id=" +
              pid +
              "&lat=" +
              _that.data.lat +
              "&lon=" +
              _that.data.lon
          });
          break;
        case "authZhiMa":
          //芝麻认证
          App.authZhima(() => {
            base.is_auth = 1;
            _that.setData({
              zhima_zuth: 1
            });
          });
          break;
        case "webView":
          //
          let id = e.currentTarget.dataset.id;
          my.navigateTo({
            url: "/pages/webView/webView?url=" + base.termsUrl + "?id=" + id
          });
          break;
      }
    },

    /**
     * 判断是否有位置权限
     */
    checkLocationAuth() {
      let _that = this;
      my.getSetting({
        success: res => {
          if (res.authSetting["location"]) {
            _that.setData({
              locationAuth: true
            });
          } else if (!res.authSetting["location"]) {
            _that.setData({
              locationAuth: false
            });
          }
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
      _that.setData({
        city: "定位中..."
      });
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
            locationAuth: true,
            city: res.city,
            province: res.province
          });
          if (_that.mapCtx) {
            _that.mapCtx.moveToLocation();
          }
          _that.httpGetIndeData();
        },
        fail(e) {
          my.hideLoading();
          _that.setData({
            city: "定位失败"
          });
          my.confirm({
            title: "温馨提示",
            content:
              "取消定位授权，可能会使部分功能无法使用，或页面信息显示不完整",
            confirmButtonText: "重新授权",
            cancelButtonText: "放弃授权",
            success: res => {
              if (res.confirm) {
                my.openSetting();
              }
            }
          });
        }
      });
    },

    /**
     * 加载首页数据
     */
    httpGetIndeData() {
      let _that = this;
      base.http.httpPost({
        url: "home/banner",
        data: {},
        complete() {
          my.stopPullDownRefresh();
        },
        success(res) {
          _that.setData({
            banner_list: res.data
          })
        }
      });
    },
    httpGetIndeData1() {
      let _that = this;
      base.http.httpPost({
        url: "home/brandList",
        data: {},
        complete() {
          my.stopPullDownRefresh();
        },
        success(res) {
          _that.setData({
            brandList: res.data
          })
        }
      });
    },
    httpGetIndeData2() {
      let _that = this;
      base.http.httpPost({
        url: "home/getTop",
        data: {},
        complete() {
          my.stopPullDownRefresh();
        },
        success(res) {
          _that.setData({
            getTop: res.data
          })
        }
      });
    },
    httpGetIndeData3() {
      let _that = this;
      base.http.httpPost({
        url: "home/getRecommend",
        data: {},
        complete() {
          my.stopPullDownRefresh();
        },
        success(res) {
          _that.setData({
            getRecommend: res.data
          })
        }
      });
    },
    httpGetIndeData4() {
      let _that = this;
      base.http.httpPost({
        url: "cat/getList",
        data: {},
        complete() {
          my.stopPullDownRefresh();
        },
        success(res) {
          let getList = res.data
          getList.map((item, index) => {
            item.title = item.catName
          })
          console.log(getList)
          _that.setData({
            tabs: getList
          })
          _that.getListByCatCode(getList[0].catCode)
        }
      });
    },
    getListByCatCode(catCode) {
       let _that = this;
      base.http.httpPost({
        url: "goods/getListByCatCode",
        data: { catCode },
        success(res) {
          _that.setData({
            getListByCatCode: res.data
          })
        }
      });
    }
  })
);
