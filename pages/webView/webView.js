/**
 * webView
 */
Page({
    data: {
        src: '',
    },
    onLoad(query) {
        // 页面加载
        if (query.url) {
            this.setData({
                src: query.url,
            })
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
});
