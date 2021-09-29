/**
 * 首页
 */
let App = getApp();
let base = App.constants;
var http = require("../../utils/http.js"); //网络请求
Page(
  base.pageCheck({
    data: {
      activeTab: 2,
      tabs: [
        { title: '新款', anchor: 'a' },
        { title: '苹果', anchor: 'b' },
        { title: '华为', anchor: 'c' },
        { title: '荣耀', anchor: 'd' },
        { title: '小米', anchor: 'e' },
        { title: '一加', anchor: 'f' },
      ],
    },
    onLoad(query) {
      // 页面加载
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

    handleChange(index) {
      this.setData({
        activeTab: index,
      });
    },
    onChange(index) {
      this.setData({
        activeTab: index,
      });
    },
  })
);
