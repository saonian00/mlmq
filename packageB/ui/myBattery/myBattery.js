/**
 * 我的车辆
 */
let App = getApp();
let base = App.constants;
Page(
  base.pageCheck({
    data: {
      showIndex: 0,
      showMap: false
    },
    onLoad(query) {
      // 页面加载
      this.httpGetData();
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
     * 点击
     */
    click(e) {
      let _that = this;
      let types = e.currentTarget.dataset.type;
      console.log(types);
      switch (types) {
        case "look":
          let index = e.currentTarget.dataset.index;
          _that.httpGetParamData(_that.data.batteryInfo.imgs[index], index);
          _that.setData({
            showMap: false
          });
          break;
        case "location":
          _that.setData({
            showMap: !_that.data.showMap
          });
          if (_that.data.batteryInfo.devicePositionVO) {
            let markers = [];
            markers.push({
              iconPath: "/res/icon_map_center.png",
              id: 1,
              latitude: _that.data.batteryInfo.devicePositionVO.lat,
              longitude: _that.data.batteryInfo.devicePositionVO.lon,
              width: 36,
              height: 36
            });
            let includePoints = [
              {
                latitude: _that.data.batteryInfo.devicePositionVO.lat,
                longitude: _that.data.batteryInfo.devicePositionVO.lon
              }
            ];
            let includePadding = {
              left: 20,
              right: 20,
              top: 20,
              bottom: 20
            };
            _that.setData({
              markers,
              includePoints,
              includePadding
            });
          } else {
            _that.setData({
              markers: null,
              includePoints: null,
              includePadding: null
            });
          }
          break;
      }
    },

    /**
     * 加载数据
     */
    httpGetData() {
      let _that = this;
      base.http.httpPost({
        loading: "处理中...",
        url: "index/index/myDevice",
        data: {
          dopost: "myDevice",
          flag: "battery"
        },
        success(res) {
          _that.setData({
            batteryInfo: res.data
          });
        }
      });
    },

    /**
     * 加载数据
     */
    httpGetParamData(pinfo, index) {
      let _that = this;
      base.http.httpPost({
        loading: "加载中...",
        url: "index/index/myDevice",
        data: {
          dopost: "getparams",
          id: pinfo.id,
          flag: pinfo.flag,
          model_id: pinfo.model_id
        },
        success(res) {
          _that.setData({
            "batteryInfo.devicePositionVO": res.data.devicePositionVO,
            "batteryInfo.params": res.data.params,
            showIndex: index
          });
        }
      });
    }
  })
);
