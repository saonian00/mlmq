/**
 * 首页
 */
let App = getApp();
let base = App.constants;
var http = require("../../utils/http.js"); //网络请求
Page(
  base.pageCheck({
    data: {
      zhima_zuth: 1, //是否芝麻授权了 1授权 0未授权
      locationAuth: false, //获取地理位置权限
      includePadding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
      },
      city: "", //城市名称
      indexData: {
        sum_store: 0,
        packages: [],
        near: ""
      }, //首页数据
      markers: [], //最近的站点marker
      security: [
        {
          icon: "/res/icon_security_gps.png",
          name: "智能防盗",
          msg: "GPS定位 智能防盗"
        },
        {
          icon: "/res/icon_security_bx.png",
          name: "盗抢险",
          msg: "20W保险 安全有保障"
        },
        {
          icon: "/res/icon_security_dc.png",
          name: "轻巧锂电",
          msg: "循环耐用 持久续航"
        },
        {
          icon: "/res/icon_security_sh.png",
          name: "售后无忧",
          msg: "性能故障 免费维修"
        }
      ]
    },
    onLoad(query) {
      // 页面加载
      let _that = this;
      if (base.isReady) {
        _that.setData({
          isReady: true,
          zhima_zuth: base.is_auth
        });
        _that.checkLocationAuth();
      } else {
        base.readyCallBcak = function() {
          _that.setData({
            isReady: true,
            zhima_zuth: base.is_auth
          });
          _that.checkLocationAuth();
        };
      }
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
        url: "index/index/index",
        data: {
          latitude: _that.data.lat,
          longitude: _that.data.lon,
          province: _that.data.province,
          city: _that.data.city
        },
        complete() {
          my.stopPullDownRefresh();
        },
        success(res) {
          let markers = [];
          _that.data.indexData = res.data;

          if (res.data.near.coordinate) {
            _that.data.indexData["near"][
              "lat"
            ] = res.data.near.coordinate.split(",")[1];
            _that.data.indexData["near"][
              "lon"
            ] = res.data.near.coordinate.split(",")[0];

            markers.push({
              iconPath: "/res/icon_map_center.png",
              id: 1,
              latitude: _that.data.indexData["near"]["lat"],
              longitude: _that.data.indexData["near"]["lon"],
              width: 36,
              height: 36
            });
            setTimeout(() => {
              _that.setData({
                includePoints: [
                  { latitude: _that.data.lat, longitude: _that.data.lon },
                  {
                    latitude: _that.data.indexData["near"]["lat"],
                    longitude: _that.data.indexData["near"]["lon"]
                  }
                ]
              });
            }, 1000);
            console.log(_that.data.includePoints, "includePoints");
          }
          _that.setData({
            indexData: res.data,
            markers: markers
          });

          //1.判断是否与超时订单
          let nowDate = new Date();
          let nowDay =
            nowDate.getFullYear() +
            "-" +
            (nowDate.getMonth() + 1) +
            "-" +
            nowDate.getDate();
          let cache_hide_due_remind_day = my.getStorageSync({
            key: "hide_due_remind_day" // 缓存数据的key
          }).data;
          if (res.data.stat == 100) {
            my.alert({
              title: "温馨提示",
              content:
                "您当前有一个订单超时，已产生滞纳金与法律风险，为了避免引起不便，请及时处理。",
              buttonText: "查看",
              success: result => {
                my.navigateTo({
                  url:
                    "/packageB/ui/orderDetail/orderDetail?id=" +
                    res.data.stat_id
                });
              }
            });
          } else if (
            res.data.stat &&
            res.data.stat != 100 &&
            res.data.stat != 0 &&
            nowDay != cache_hide_due_remind_day
          ) {
            //一天提示一次
            my.confirm({
              title: "温馨提示",
              content:
                "您租赁的车辆还有" +
                res.data.stat +
                "天即将到期，为了方便您的使用可尽早续租哦。",
              confirmButtonText: "续租",
              cancelButtonText: "暂不",
              success: result => {
                if (result.confirm) {
                  my.navigateTo({
                    url:
                      "/packageB/ui/orderDetail/orderDetail?id=" +
                      res.data.stat_id
                  });
                } else {
                  my.setStorageSync({
                    key: "hide_due_remind_day", // 缓存数据的key
                    data: nowDay // 要缓存的数据
                  });
                }
              }
            });
          }
        }
      });
    }
  })
);
