/**
 * 我的订单
 */
let App = getApp();
let base = App.constants;
Page(base.pageCheck({
  data: {
    currentPage: 1,
    totalPage: 1,
    unfinished_orderList: [],
    completed_orderList: [],
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
      currentPage: 1,
    })
    this.httpGetList();
  },
  onReachBottom() {
    // 页面被拉到底部
    if (this.data.currentPage < this.data.totalPage) {
      this.setData({
        currentPage: this.data.currentPage + 1,
      })
      this.httpGetList();
    }
  },

  //长按复制
  onLongTap(e) {
    console.log(e.currentTarget.dataset.sn)
    my.setClipboard({
      text: e.currentTarget.dataset.sn,
    });
    my.showToast({
      type: 'success',
      content: '订单号已复制',
      duration: 1000
    });
  },

  /**
  * 加载订单列表
  */
  httpGetList() {
    let _that = this;
    base.http.httpPost({
      loading: '处理中...',
      url: 'index/index/order',
      data: {
        dopost: 'list',
        p: _that.data.currentPage,
      },
      complete() {
        my.stopPullDownRefresh();
      },
      success(res) {
        _that.setData({
          unfinished_orderList: res.data.no_order,
          completed_orderList: res.data.yes_order,
          currentPage: _that.data.currentPage,
          totalPage: res.data.last_page,
        })
      }
    })
  }
}));
