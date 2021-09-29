
var http = require('./utils/http.js'); //网络请求
var util = require('/utils/util.js'); //工具js
var pageCheck = require('./utils/filter.js'); //导航守卫
var Event = require('./utils/event/EventBus.js'); //event Bus
var EventModel = require('./utils/event/EventModel.js'); //event

App({
    onLaunch(options) {
        // 第一次打开
        let _that = this;
        let token = my.getStorageSync({ key: http.KEY_TOKEN });
        if (token && token.is_auth) {
            _that.constants.is_auth = token.is_auth;
        }
        _that.constants.mobile = token.mobile;
        my.getAuthCode({
            success: (res) => {
                console.log(res)
                // http.httpLogin({
                //     url: 'user/index/newlogin',
                //     data: {
                //         auth_code: res.authCode,
                //     },
                //     success(result) {
                //         console.log(result)
                //         _that.constants.is_auth = result.data.is_auth;
                //         _that.constants.mobile = result.data.mobile;
                //         my.setStorageSync({
                //             key: http.KEY_TOKEN, // 缓存数据的key
                //             data: result.data, // 要缓存的数据
                //         });
                //         _that.constants.isReady = true;
                //         if (_that.constants.readyCallBcak != null) {
                //             _that.constants.readyCallBcak();
                //         }
                //         if (result.data.mobile == '18888888888' || !result.data.mobile || result.data.mobile == '0') {
                //             my.navigateTo({
                //                 url: '/pages/login/login',
                //             });
                //         }
                //     }
                // })
            },
        });
    },
    onShow(options) {
        // 从后台被 scheme 重新打开
    },
    constants: {
        isReady: false,
        readyCallBcak: null,
        http: http, //网络请求
        util: util,
        pay: util.pay, //统一支付
        pageCheck: pageCheck.pageCheck,
        key_token: http.KEY_TOKEN, //tokenKey
        //Toast时间
        toast_short: http.TOAST_SHORT,
        toast_long: http.TOAST_LONG,
        //事件
        Event: Event,
        EventModel: EventModel,
        termsUrl: 'https://admin.zuche.miway.com/terms',
        is_auth: 0,//是否芝麻认证
        mobile: 0,//手机号，没有绑定时为0
    },
    /**
     * 检测是否登录
     * @param toLogin 是否需要去登录
     */
    checkLogin: function (toLogin) {
        let token = my.getStorageSync({ key: this.constants.key_token }).data;
        if (token.mobile && token.mobile != 0) {
            return true;
        }
        if (toLogin) {
            my.navigateTo({
                url: '/pages/login/login',
            })
        }
        return false;
    },
    /**
     * 芝麻认证
     * 
     * @param {*} success 
     */
    authZhima(callback_success) {
        let _that = this;
        http.httpPost({
            url: 'user/index/zhima',
            data: {
            },
            success(result) {
                my.tradePay({
                    orderStr: result.data.orderStr,
                    success: (res) => {
                        if (res.resultCode == 9000) {
                            my.showToast({
                                type: 'success',
                                content: '认证成功',
                            });
                            _that.constants.is_auth = 1;
                            if (callback_success) {
                                callback_success();
                            }
                        }
                    },
                });
            }
        })
    },
});
