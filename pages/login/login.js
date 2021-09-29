/**
 * 登录
 */
var CountDown = require('../../utils/countdown.js');
var http = require('../../utils/http.js'); //网络请求

let App = getApp();
let base = App.constants;
Page(base.pageCheck({
    data: {
        tabIndex: 1,
        isReady: false,
        isReady: true,
        phone: '',
        code: '',
        count: '',
        user_id: ''
    },
    onLoad(query) {
        let _that = this;
        //页面加载
        if (base.isReady) {
            _that.setData({
                isReady: true,
            })
        } else {
            base.readyCallBcak = () => {
                _that.setData({
                    isReady: true,
                })
            }
        }
         this.countdown = new CountDown(this);
          let tokenObj = my.getStorageSync({
            key: 'zuche_c_token', // 缓存数据的key
        }).data;

         this.setData({
            user_id: tokenObj.user_id,
        })
        // my.clearStorage();
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

    //输入
    inputChange(e) {
        let types = e.currentTarget.dataset.type;
        this.setData({
            [`${types}`]: e.detail.value,
        })
    },

    //点击tab
    clickTabItem(e) {
        this.setData({
            tabIndex: e.currentTarget.dataset.index,
        })
    },

    /**
     * 快速登录
     * 
     * @param {*} e 
     */
    bindGetPhoneNumber(e) {
        my.getPhoneNumber({
            success: (res) => {
                let encryptedData = res.response;
                console.log(res);
            },
        });
    },
    httpConfirmCode() {
        let _that = this;
        base.http.httpPost({
            loading: '加载中...',
            url: 'index/send/checkcode',
            data: {
                mobile: _that.data.phone,
                user_id: _that.data.user_id,
                code: _that.data.code
            },
            success(res) {
                my.showToast({
                    type: 'success',
                    content: '登录成功'
                });
                my.getAuthCode({
                    success: (res) => {
                        console.log(res)
                        http.httpLogin({
                            url: 'user/index/newlogin',
                            data: {
                                auth_code: res.authCode,
                            },
                            success(result) {
                                my.setStorageSync({
                                    key: http.KEY_TOKEN, // 缓存数据的key
                                    data: result.data, // 要缓存的数据
                                });
                                if(result.data.is_certify == 1){
                                    setTimeout(() => {
                                        my.reLaunch({
                                            url: '/pages/index/index',
                                        });
                                    }, 2000)
                                }else{
                                    my.navigateTo({
                                        url: '/pages/attestation/attestation',
                                    });
                                }
                            }
                        })
                    },
                });
            },
            fail(e) {
                my.alert({
                    title: e.msg,
                    buttonText: '我知道了'
                });
            }
        })
    },
    httpGetCode() {
        let _that = this;
        const isPhone = /^1\d{10}$/ || /^[0-9]*$/;
        if (!isPhone.test(_that.data.phone)) {
            my.showToast({
                type: 'none',
                content: '手机号码有误',
                duration: 3000,
            });
            return;
        }
        base.http.httpPost({
            loading: '加载中...',
            url: 'index/send/sendmsg',
            data: {
                mobile: _that.data.phone,
                user_id: _that.data.user_id,
            },
            success(res) {
                console.log(res)
                _that.countdown.start();
            },
            fail(e) {
                my.alert({
                    title: e.msg,
                    buttonText: '我知道了'
                });
            }
        })
    },

    /**
     * 手机号密码登录
     */
    clickLogin() {
        let _that = this;
        _that.setData({
            saveIng: true,
        })
        base.http.httpLogin({
            url: 'user/bndex/mobilelogin',
            data: {
                mobile: _that.data.phone,
                password: _that.data.code,
            },
            success(res) {
                _that.setData({
                    saveIng: false,
                })
                my.showToast({
                    type: 'success',
                    content: '登录成功'
                });
                my.setStorageSync({
                    key: base.key_token, // 缓存数据的key
                    data: res.data, // 要缓存的数据
                });
                if (res.data.is_choose == 1) {
                    my.reLaunch({
                        url: '/pages/changeSite/changeSite?id=' + res.data.site_id,
                    });
                } else if(res.data.is_certify == 1) {
                    setTimeout(() => {
                        my.reLaunch({
                            url: '/pages/index/index',
                        });
                    }, 2000)
                }else{
                    my.navigateTo({
                        url: '/pages/attestation/attestation',
                    });
                }
            },
            fail() {
                _that.setData({
                    saveIng: false,
                })
            }
        })
    }


}));
