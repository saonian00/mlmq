Component({
  props: {
    facing: 'front',
    appName: '',
    serviceName: '',
    useLiveFaceCheck: false,
    minRotate: -1
  },
  didMount: function didMount() {
    this.webViewContext = my.createWebViewContext('am-face-detection');
    this.doFaceLeftResolve = null;
    this.isDidFaceLeftResolve = false;
    this.doFaceRightResolve = null;
    this.isDidFaceRightResolve = false;
  },
  didUnMount: function didUnMount() {
    this.webViewContext.postMessage({
      action: 'releaseCamera'
    });
  },
  methods: {
    doLeftFaceCheck: function doLeftFaceCheck() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.isDidFaceLeftResolve = false;

        _this.webViewContext.postMessage({
          action: 'doFaceLeft',
          data: {
            minRotate: _this.props.minRotate
          }
        });

        _this.doFaceLeftResolve = resolve;
        setTimeout(function () {
          if (!_this.isDidFaceLeftResolve) {
            reject();
          }
        }, 30000);
      });
    },
    doRightFaceCheck: function doRightFaceCheck() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.isDidFaceRightResolve = false;

        _this2.webViewContext.postMessage({
          action: 'doFaceRight',
          data: {
            minRotate: _this2.props.minRotate
          }
        });

        _this2.doFaceRightResolve = resolve;
        setTimeout(function () {
          if (!_this2.isDidFaceRightResolve) {
            reject();
          }
        }, 30000);
      });
    },
    onMessage: function onMessage(e) {
      var _this3 = this;

      var _this$props = this.props,
          onFaceStatusChange = _this$props.onFaceStatusChange,
          onFail = _this$props.onFail,
          onSuccessBtnTap = _this$props.onSuccessBtnTap;
      var _e$detail = e.detail,
          action = _e$detail.action,
          data = _e$detail.data;

      if (action === 'resignSuccessBtnClick') {
        if (onSuccessBtnTap) {
          onSuccessBtnTap();
        }
      }

      if (action === 'faceRotated' && data.forward === 'left') {
        this.isDidFaceLeftResolve = true;
        this.doFaceLeftResolve(data.imageBase64);
        return;
      }

      if (action === 'faceRotated' && data.forward === 'right') {
        this.isDidFaceRightResolve = true;
        this.doFaceRightResolve(data.imageBase64);
        return;
      }

      if (action === 'captureImage') {
        if (onFaceStatusChange) {
          var promise = onFaceStatusChange({
            imageBase64: data.imageBase64,
            faceRect: data.faceRect
          }, {
            doLeftFaceCheck: this.doLeftFaceCheck.bind(this),
            doRightFaceCheck: this.doRightFaceCheck.bind(this)
          });

          if (promise instanceof Promise) {
            promise.then(function () {
              _this3.webViewContext.postMessage({
                action: 'requestSuccess'
              });
            })["catch"](function () {
              _this3.webViewContext.postMessage({
                action: 'requestFailure'
              });
            });
          } else {
            this.webViewContext.postMessage({
              action: 'requestSuccess'
            });
          }
        }
      } else {
        /* eslint-disable */
        if (onFail) {
          onFail({
            code: data.code,
            message: data.message
          });
        }
      }
    }
  }
});