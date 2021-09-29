/**
 * @auth
 * @date 2018/9/6
 * @desc 网络请求工具
 */

//导包
var md5 = require("./md5.js");

var u = {};

//请求返回体模型
u.httpModel = {
  code: 0,
  data: "",
  msg: ""
};

//请求方式
u.GET = "GET"; //GET类型的请求
u.POST = "POST"; //POST类型的请求

//常量
u.API_KEY = "AS28@~#*shFG486shfksdfSDF@#%dsdf"; //APIKEY

u.KEY_TOKEN = "zuche_c_token"; //本地token键
u.KEY_BIND = "bind"; //绑定的参数

u.RELOGIN_PATH = "/pages/login/login"; //重新登录的绝对路径

//短提示默认长短时间
u.TOAST_SHORT = 2000; //弹窗时间短
u.TOAST_LONG = 3000; //弹窗时间长

//请求状态CODE
u.CODE_STATUS_SUCCESS = 200; //开发者服务器返回的 HTTP 成功状态码
u.CODE_SUCCESS = 1; //接口请求成功的CODE
u.CODE_FAIL = 0; //接口请求失败

u.CODE_TOKEN_TIMEOUT = -2; //用户凭证过期
u.CODE_FIRSTLOGIN = 2; //用户第一次

//服务器地址
u.API_SERVICE = "http://106.75.215.232:9090/"; //生产服务器
// u.API_SERVICE = "http://ymzc-api.fintechzh.com/"; //测试服务器

/**
 * 拦截器
 *
 * @param reqParams 请求的参数
 */
u.requestInterceptor = function (paramData) {
  //1.做请求前的拦截处理
  var tempsignurl = "";
  var tempurl = "";
  var paramCount = u.objCount(paramData);
  var i = 0;
  if (paramData["Verification"] && paramData["Verification"] == "true") {
    tempsignurl = "uid=" + paramData["uid"];
  } else {
    for (var item in paramData) {
      //用javascript的for/in循环遍历对象的属性
      if (tempsignurl == "") {
        tempsignurl = item + "=" + paramData[item];
      } else {
        tempsignurl += "&" + item + "=" + paramData[item];
      }
      // paramData[item] = encodeURIComponent(paramData[item]);
      i++;
    }
  }
  var timestamp = Date.parse(new Date()) / 1000;
  var tempSign = "";
  tempSign =
    u.API_KEY +
    (tempsignurl.length > 0 ? tempsignurl + "&" : tempsignurl) +
    "_=" +
    timestamp;
  tempSign = md5.hexMD5(tempSign);
  // paramData["_"] = timestamp; //时间戳
  // paramData["sign"] = tempSign; //密文
  // paramData["clientfrom"] = "alipay"; //操作系统
  // paramData["apiversion"] = "1.0"; //API版本

  return paramData;
};

/**
 * 请求返回统一处理
 *
 */
u.handleResponse = function (reqParams, result) {
  console.log(result.status);
  if (
    result.status == u.CODE_STATUS_SUCCESS ||
    result.statusCode == u.CODE_STATUS_SUCCESS
  ) {
    u.httpModel = result.data;
    console.log(u.httpModel.data);
    if (u.httpModel.code == u.CODE_SUCCESS) {
      //接口成功返回
      if (reqParams.success) reqParams.success(u.httpModel);
    } else if (u.httpModel.code == u.CODE_TOKEN_TIMEOUT) {
      //登录异常时重启应用到登录页面进行登录
      u.reLogin();
    } else if (u.httpModel.code == u.CODE_FIRSTLOGIN) {
      if (reqParams.fail) {
        reqParams.fail(u.httpModel);
      }
    } else if (u.httpModel.code == u.CODE_FAIL) {
      my.showToast({
        type: "none",
        content: u.httpModel.msg,
        duration: u.TOAST_SHORT
      });
      if (reqParams.fail) {
        reqParams.fail(u.httpModel);
      }
    } else {
      //其他的code码返回到页面自行处理
      my.showToast({
        type: "none",
        content: u.httpModel.msg,
        duration: u.TOAST_SHORT
      });
      if (reqParams.fail) reqParams.fail(u.httpModel);
    }
  } else {
    console.log(
      "请求错误 : " +
      "错误码：" +
      result.status +
      " / " +
      "错误信息：" +
      result.errMsg
    );
    my.showToast({
      type: "none",
      content: "请求失败：" + result.status,
      duration: u.TOAST_LONG
    });
    u.httpModel.code = result.status;
    u.httpModel.msg = result.status;
    if (reqParams.fail) reqParams.fail(u.httpModel);
  }
};

/**
 * 添加必要的参数
 *
 * @param reqParams 请求的参数
 */
u.addMustParams = function (paramData) {
  if (!paramData) {
    paramData = {};
  }
  //1.先判断是否需要加上必要参数
  let tokenObj = my.getStorageSync({
    key: u.KEY_TOKEN // 缓存数据的key
  }).data;
  if (tokenObj != null) {
    if (tokenObj.oid) paramData["oid"] = "" + tokenObj.oid;
    if (tokenObj.user_id) paramData["user_id"] = "" + tokenObj.user_id; //赋值UID
    if (tokenObj.wxid) paramData["wxid"] = "" + tokenObj.wxid;
    if (tokenObj.mid) paramData["mid"] = "" + tokenObj.mid;
    if (tokenObj.type) paramData["wxtype"] = "" + tokenObj.type;
    if (tokenObj.eid) paramData["eid"] = "" + tokenObj.eid;
    if (tokenObj.shopid && !paramData.shopid) {
      paramData["shopid"] = "" + tokenObj.shopid;
    }
  } else {
    u.reLogin();
  }
  //过滤null
  let keyArr = Object.keys(paramData);
  keyArr.forEach((item, index) => {
    if (
      paramData[item] == null ||
      paramData[item] == undefined ||
      paramData[item] == "null" ||
      paramData[item] == "undefined"
    ) {
      paramData[item] = "";
    }
  });

  return paramData;
};

/**
 * 发送请求
 *
 * @param reqParams 	请求封装的参数
 * @param requestType	什么类型的请求 GET POST
 * @param addMustParams	是需要添加必传参数
 */
u.request = function (reqParams, requestType, addMustParams) {
  //1.默认请求方式为POST
  var method = u.POST;
  if (requestType == u.GET) {
    method = u.GET;
  } else if (requestType == u.POST) {
    //post请求 需要携带必要参数
    if (addMustParams) {
      reqParams.data = u.addMustParams(reqParams.data);
    }
    method = u.POST;
  }

  //2.参数加密
  reqParams.data = u.requestInterceptor(reqParams.data);

  //3.打印请求地址
  u.logRequestUrl(reqParams);

  //4.判断是否需要显示loading
  var isLoading = false;
  if (reqParams.loading != null && reqParams.loading != "") {
    isLoading = true;
    my.showLoading({
      content: reqParams.loading
    });
  }

  //5.发出请求
  my.request({
    url: u.API_SERVICE + reqParams.url,
    data: reqParams.data,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "token": "9bf71aca-bd5a-4059-a316-1db2965760aa",
      "shopId": 1
    },
    method: method,
    complete: function (msg) {
      if (reqParams.complete) reqParams.complete(msg);
    },
    success: function (result) {
      //关闭loading
      if (isLoading) my.hideLoading();

      u.handleResponse(reqParams, result);
    },
    fail: function (e) {
      //关闭loading
      if (isLoading) my.hideLoading();
      e = {
        msg: "请求失败：" + e.errMsg
      };
      if (reqParams.fail) reqParams.fail(e);
    }
  });
};

/**
 * GET请求
 *
 * @param reqParams
 * @desc  一般用于登录等不携带token
 */
u.httpGet = function (reqParams) {
  u.request(reqParams, u.GET, true);
};

/**
 * POST请求
 *
 * @param reqParams
 * @desc  一般用于携带token
 */
u.httpPost = function (reqParams) {
  u.request(reqParams, u.POST, true);
};

/**
 * POST请求
 *
 * @param reqParams
 * @desc  登录等接口不加入token
 */
u.httpLogin = function (reqParams) {
  u.request(reqParams, u.POST, false);
};

/**
 * 上传文件
 *
 * @param reqParams
 * @desc
 */

u.uploadFile = function (reqParams) {
  //1.添加必要参数
  reqParams.data = u.addMustParams(reqParams.data);
  reqParams.data["Verification"] = "true";
  //2.参数加密
  reqParams.data = u.requestInterceptor(reqParams.data);

  //3.打印请求地址
  u.logRequestUrl(reqParams);

  //4.判断是否需要显示loading
  var isLoading = false;
  if (reqParams.loading != null && reqParams.loading != "") {
    isLoading = true;
    my.showLoading({
      content: reqParams.loading
    });
  }

  //5.发送请求
  my.uploadFile({
    url: u.API_SERVICE + reqParams.url, //仅为示例，非真实的接口地址
    filePath: reqParams.filePath,
    fileName: reqParams.name,
    formData: reqParams.data,
    fileType: reqParams.fileType,
    complete: function (msg) {
      if (reqParams.complete) reqParams.complete(msg);
    },
    success: function (result) {
      //关闭loading
      console.log(result);
      if (isLoading) my.hideLoading();
      try {
        result.data = JSON.parse(result.data + "");
      } catch (e) {
        console.log(result, "e");
      }
      u.handleResponse(reqParams, result);
    },
    fail: function (e) {
      //关闭loading
      if (isLoading) my.hideLoading();
      e = {
        msg: "请求失败：" + e.errMsg
      };
      if (reqParams.fail) reqParams.fail(e);
    }
  });
};

/**
 * 打印请求地址
 */
u.logRequestUrl = function (requestParams) {
  //显示请求路径
  var url = "请求路径: " + u.API_SERVICE + requestParams.url;
  var paramCount = u.objCount(requestParams.data);
  if (paramCount > 0) {
    url += "?";
  }
  var i = 0;
  for (var item in requestParams.data) {
    //用javascript的for/in循环遍历对象的属性
    if (i != paramCount - 1) {
      //不是最后一个才加上&
      url += item + "=" + requestParams.data[item] + "&";
    } else {
      url += item + "=" + requestParams.data[item];
    }

    i++;
  }
  console.log(url);
};

/**
 * 获取对象、数组的长度、元素个数
 *
 * @param obj 要计算长度的元素，可以为object、array、string
 */
u.objCount = function (obj) {
  var objType = typeof obj;
  if (objType == "string") {
    return obj.length;
  } else if (objType == "object") {
    var objLen = 0;
    for (var i in obj) {
      objLen++;
    }
    return objLen;
  }
  return false;
};

/**
 * 重新登录
 */
u.reLogin = function () {
  //1.提示
  // my.showToast({
  //   type: "none",
  //   content: "登录失效",
  //   duration: u.TOAST_SHORT
  // });
  // //清除本地数据
  // my.clearStorageSync();
  // //2.延时 等待提示完成后跳转
  // setTimeout(function () {
  //   my.navigateTo({ url: u.RELOGIN_PATH });
  //   getApp().onLaunch();
  // }, u.TOAST_SHORT);
};

//抛出方法
module.exports = u;
