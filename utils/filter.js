/**
 * 检测版本更新
 */

function pageCheck(pageObj) {
    if (pageObj.onShow) {
        let _onShow = pageObj.onShow;
        // 使用onShow的话需要传递options
        pageObj.onShow = function() {
            // 获取小程序更新机制兼容
            if (my.canIUse('getUpdateManager')) {
                const updateManager = my.getUpdateManager()
                updateManager.onCheckForUpdate(function(res) {
                    // 请求完新版本信息的回调
                    if (res.hasUpdate) {
                        updateManager.onUpdateReady(function() {
                            my.confirm({
                                title: '更新提示',
                                content: '新版本已经准备好，是否重启应用？',
                                success: function(res) {
                                    if (res.confirm) {
                                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                        updateManager.applyUpdate()
                                    }
                                }
                            })
                        })
                        updateManager.onUpdateFailed(function() {
                            // 新的版本下载失败
                            my.confirm({
                                title: '已经有新版本了哟~',
                                content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
                            })
                        })
                    }
                })
            } else {
                // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
                my.confirm({
                    title: '提示',
                    content: '当前版本过低，无法使用该功能，请升级到最新版本后重试。'
                })
            }

            // 获取当前页面
            let currentInstance = getPageInstance();
            _onShow.call(currentInstance);

        }
    }
    return pageObj;
}
// 获取当前页面    
function getPageInstance() {
    var pages = getCurrentPages();
    return pages[pages.length - 1];
}
module.exports = {
    pageCheck: pageCheck
}