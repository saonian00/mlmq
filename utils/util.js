const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const getNowDate = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

//获取节点信息
const queryView = (context, name, success) => {
    const query = my.createSelectorQuery().in(context)
    query.select(name).boundingClientRect(function(res) {
        success(res);
    }).exec()
}

/**
 * 统一支付
 */
const pay = function(params) {
    my.tradePay({
        tradeNO: params.tradeNO,
        complete: function(msg) {
            if (params.complete) {
                params.complete(msg);
            }
        },
        success: function(result) {
            if (result.resultCode == 9000) {
                my.showToast({
                    content: '支付成功',
                })
                if (params.success) {
                    params.success(result);
                }
            } else {
                let toastMsg = '支付失败，请重试';
                switch (result.resultCode) {
                    case 8000:
                        toastMsg = '正在处理中。';
                        break;
                    case 4000:
                        toastMsg = '支付失败。';
                        break;
                    case 6001:
                        toastMsg = '支付取消。';
                        break;
                    case 6002:
                        toastMsg = '网络连接出错。';
                        break;
                    case 6004:
                        toastMsg = '处理结果未知。';
                        break;
                    default:
                        toastMsg = '支付失败，请重试';
                        break;

                }
                my.showToast({
                    type: 'none',
                    content: toastMsg,
                })
                if (params.fail) {
                    params.fail(result);
                }
            }
        },
        fail: function(e) {

        }
    })
}

module.exports = {
    formatTime: formatTime,
    queryView: queryView,
    pay: pay,
    getNowDate: getNowDate,
}
