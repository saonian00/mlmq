/**
 * 选择站点
 */
let App = getApp();
let base = App.constants;
Page(
  base.pageCheck({
    data: {
      locationAuth: false, //获取地理位置权限
      p_id: "",
      type: "", //look查看 choose选择
      lat: "",
      lon: "",
      siteList: [], //站点列表
      currentPage: 1,
      totalPage: 1,
      includePadding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
      }
    },
    onLoad(query) {
      // 页面加载
      this.setData({
        lat: query.lat ? query.lat : "",
        lon: query.lon ? query.lon : ""
      });
      if (query.p_id) {
        this.setData({
          p_id: query.p_id
        });
      }
      if (query.type) {
        this.setData({
          type: query.type
        });
        if (query.type === "look") {
          my.setNavigationBar({
            title: "附近站点"
          });
        }
      }
    },
    onReady() {
      // 页面加载完成
      this.mapCtx = my.createMapContext("mapView");
      this.mapCtx.gestureEnable({ isGestureEnable: 0 });
    },
    onShow() {
      // 页面显示
      if (this.data.lat != "" && this.data.lon != "") {
        this.httpGetData();
      } else {
        if (!this.data.locationAuth) {
          this.checkLocationAuth();
        }
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
      this.setData({
        currentPage: 1
      });
      if (!this.data.locationAuth) {
        this.checkLocationAuth();
      }
    },
    onReachBottom() {
      // 页面被拉到底部
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
            locationAuth: true
          });
          _that.httpGetData(res.latitude, res.longitude);
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
        case "choose":
          my.navigateBack({
            success() {
              setTimeout(() => {
                base.Event.send(
                  base.EventModel.EVENT_CHOOSE_SITE,
                  _that.data.siteList[_that.data.topSiteIndex]
                );
              }, 300);
            }
          });
          break;
        case "callPhone":
          let phone = e.currentTarget.dataset.phone;
          my.makePhoneCall({
            number: phone // 电话号码
          });
          break;
        case "openMap":
          let latlog = _that.data.siteList[_that.data.topSiteIndex].coordinate
            ? _that.data.siteList[_that.data.topSiteIndex].coordinate.split(",")
            : ["", ""];
          my.openLocation({
            longitude: latlog ? latlog[0] : "", // 经度
            latitude: latlog ? latlog[1] : "", // 纬度
            name: _that.data.siteList[_that.data.topSiteIndex].name, // 位置名称
            address: _that.data.siteList[_that.data.topSiteIndex].address // 地址的详细说明
          });
          break;
        case "look":
          //查看
          let index = e.currentTarget.dataset.index;
          let markers = [];
          let siteLatLon = [];
          if (_that.data.siteList[index].coordinate) {
            siteLatLon = _that.data.siteList[index].coordinate.split(",");
          }
          markers.push({
            iconPath: "/res/icon_map_center.png",
            id: 1,
            latitude: siteLatLon.length > 0 ? siteLatLon[1] : "",
            longitude: siteLatLon.length > 0 ? siteLatLon[0] : "",
            width: 36,
            height: 36
          });
          // if (_that.data.type === 'choose') {
          _that.setData({
            markers: markers,
            topSiteIndex: index,
            includePoints: [
              { latitude: _that.data.lat, longitude: _that.data.lon },
              { latitude: markers[0].latitude, longitude: markers[0].longitude }
            ]
          });
          // }
          break;
        case "getNextPage":
          //下一页
          this.setData({
            currentPage: this.data.currentPage + 1
          });
          this.httpGetData();
          break;
      }
    },

    /**
     * 加载数据
     */
    httpGetData(latitude, longitude) {
      let _that = this;
      base.http.httpPost({
        url: "user/repair/packageRepairSites",
        data: {
          latitude,
          longitude,
          p_id: _that.data.p_id,
          p: _that.data.currentPage
        },
        complete() {
          my.stopPullDownRefresh();
        },
        success(res) {
          if (_that.data.currentPage == 1) {
            _that.data.siteList = [];
          }
          if (
            _that.data.siteList.length == 0 && res.data.data
              ? res.data.data.length > 0
              : false
          ) {
            let markers = [];
            let siteLatLon = [];
            if (res.data.data[0].coordinate) {
              siteLatLon = res.data.data[0].coordinate.split(",");
            }
            markers.push({
              iconPath: "/res/icon_map_center.png",
              id: 1,
              latitude: siteLatLon.length > 0 ? siteLatLon[1] : "",
              longitude: siteLatLon.length > 0 ? siteLatLon[0] : "",
              width: 36,
              height: 36
            });
            _that.setData({
              markers: markers,
              topSiteIndex: 0
            });
            setTimeout(() => {
              _that.setData({
                includePoints: [
                  { latitude: _that.data.lat, longitude: _that.data.lon },
                  {
                    latitude: markers[0].latitude,
                    longitude: markers[0].longitude
                  }
                ]
              });
            }, 1000);
          }
          _that.data.siteList = _that.data.siteList.concat(res.data.data);
          _that.setData({
            siteList: _that.data.siteList,
            currentPage: _that.data.currentPage,
            totalPage: res.data.last_page
          });
        }
      });
    }
  })
);
