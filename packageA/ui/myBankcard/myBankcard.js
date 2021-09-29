/**
 * 我的银行卡
 */
let App = getApp();
let base = App.constants;
Page(
  base.pageCheck({
    data: {
      bankCardList: []
    },
    onLoad(query) {
      // 页面加载
      if (query.orderData) {
        this.setData({
          orderData: query.orderData
        });
      }
      if (query.orderId) {
        this.setData({
          orderId: query.orderId
        });
      }
      this.httpGetList();
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
      this.httpGetList();
    },
    onReachBottom() {
      // 页面被拉到底部
    },

    /**
     * 加载银行卡列表
     */
    httpGetList() {
      let _that = this;
      base.http.httpPost({
        url: "user/index/bankCardList",
        complete() {
          my.stopPullDownRefresh();
        },
        success(res) {
          _that.setData({
            bankCardList: res.data
          });
        }
      });
    }
  })
);
