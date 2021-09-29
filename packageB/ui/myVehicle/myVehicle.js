/**
 * 我的车辆
 */
let App = getApp();
let base = App.constants;
Page(
  base.pageCheck({
    data: {
      showIndex: 0
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
          _that.httpGetParamData(_that.data.bikeInfo.imgs[index], index);
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
          flag: "bike"
        },
        success(res) {
          _that.setData({
            bikeInfo: res.data
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
            "bikeInfo.params": res.data.params,
            showIndex: index
          });
        }
      });
    }
  })
);
