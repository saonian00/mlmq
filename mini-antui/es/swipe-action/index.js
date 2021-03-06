var _my$getSystemInfoSync = my.getSystemInfoSync(),
    windowWidth = _my$getSystemInfoSync.windowWidth;

var isV2 = my.canIUse('movable-view.onTouchStart');
Component({
  data: {
    leftPos: 0,
    swiping: false,
    holdSwipe: true,
    viewWidth: windowWidth,
    x: 0,
    actionWidth: 0,
    transitionVal: 'none'
  },
  props: {
    className: '',
    right: [],
    restore: false,
    index: null,
    height: 52,
    enableNew: false
  },
  didMount: function didMount() {
    var _this = this;

    var enableNew = this.props.enableNew;
    var useV2 = isV2 && enableNew;
    this.btnWidth = 0;
    this.setData({
      useV2: useV2
    });
    this.setBtnWidth();

    if (useV2) {
      setTimeout(function () {
        _this.setData({
          transitionVal: 'transform 100ms'
        });
      }, 500);
    }
  },
  didUpdate: function didUpdate(_prevProps, prevData) {
    var restore = this.props.restore;
    var _this$data = this.data,
        holdSwipe = _this$data.holdSwipe,
        useV2 = _this$data.useV2;

    if (restore === true && _prevProps.restore !== restore || prevData.holdSwipe === true && holdSwipe === false) {
      this.setData({
        leftPos: 0,
        swiping: false,
        x: this.btnWidth // V2

      });
    }

    if (!useV2) {
      this.setBtnWidth();
    }
  },
  methods: {
    setBtnWidth: function setBtnWidth() {
      var _this2 = this;

      my.createSelectorQuery().select(".am-swipe-right-" + this.$id).boundingClientRect().exec(function (ret) {
        _this2.btnWidth = ret && ret[0] && ret[0].width || 0;

        if (isV2 && _this2.props.enableNew) {
          _this2.setData({
            actionWidth: _this2.btnWidth,
            x: _this2.btnWidth
          });
        }
      });
    },
    onSwipeTap: function onSwipeTap() {
      if (!this.data.swiping && this.data.x < 0) {
        this.setData({
          leftPos: 0,
          swiping: false,
          x: 0
        });
      }
    },
    onSwipeStart: function onSwipeStart(e) {
      this.touchObject = {
        startX: e.touches[0].pageX,
        startY: e.touches[0].pageY
      };
      var _this$props = this.props,
          index = _this$props.index,
          onSwipeStart = _this$props.onSwipeStart;

      if (onSwipeStart) {
        onSwipeStart({
          index: index
        });
      }
    },
    onSwipeMove: function onSwipeMove(e) {
      var touchObject = this.touchObject;
      var touchePoint = e.touches[0];
      var leftPos = this.data.leftPos;
      touchObject.endX = touchePoint.pageX; // ????????????????????????????????????

      if (touchObject.direction === undefined) {
        var direction = 0;
        var xDist = touchObject.startX - touchePoint.pageX || 0;
        var yDist = touchObject.startY - touchePoint.pageY || 0;
        var r = Math.atan2(yDist, xDist);
        var swipeAngle = Math.round(r * 180 / Math.PI);

        if (swipeAngle < 0) {
          swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if (swipeAngle <= 45 && swipeAngle >= 0) {
          direction = 1;
        }

        if (swipeAngle <= 360 && swipeAngle >= 315) {
          direction = 1;
        }

        if (swipeAngle >= 135 && swipeAngle <= 225) {
          direction = -1;
        }

        touchObject.direction = direction;
      } // ?????????????????????????????????


      if (touchObject.direction !== 0) {
        var newLeftPos = leftPos; // ????????????

        var distance = touchObject.endX - touchObject.startX; // ??????

        if (distance < 0) {
          newLeftPos = Math.max(distance, -this.btnWidth); // ??????
        } else {
          newLeftPos = 0;
        }

        if (Math.abs(distance) > 10) {
          this.setData({
            leftPos: newLeftPos,
            swiping: distance < 0
          });
        }
      }
    },
    onSwipeEnd: function onSwipeEnd(e) {
      var touchObject = this.touchObject;

      if (touchObject.direction !== 0) {
        var touchePoint = e.changedTouches[0];
        touchObject.endX = touchePoint.pageX;
        var leftPos = this.data.leftPos;
        var distance = touchObject.endX - touchObject.startX;
        var newLeftPos = leftPos;

        if (distance < 0) {
          if (Math.abs(distance + leftPos) > this.btnWidth * 0.7) {
            newLeftPos = -this.btnWidth;
          } else {
            newLeftPos = 0;
          }
        }

        this.setData({
          leftPos: newLeftPos,
          swiping: false
        });
      }
    },
    onChange: function onChange() {
      if (!this.data.swiping) {
        this.setData({
          swiping: true
        });
      }
    },
    onChangeEnd: function onChangeEnd(e) {
      var _this3 = this;

      var actionWidth = this.data.actionWidth;
      var x = e.detail.x;
      this.setData({
        x: x < actionWidth / 2 ? -1 : actionWidth - 1,
        swiping: false
      }, function () {
        _this3.setData({
          x: _this3.data.x === -1 ? 0 : actionWidth
        });
      });
    },
    done: function done() {
      var _this4 = this;

      this.setData({
        holdSwipe: true
      }, function () {
        _this4.setData({
          holdSwipe: false
        });
      });
    },
    onItemClick: function onItemClick(e) {
      var _this5 = this;

      var onRightItemClick = this.props.onRightItemClick;
      var holdSwipe = this.data.holdSwipe;

      if (onRightItemClick) {
        var index = e.target.dataset.index;
        onRightItemClick({
          index: index,
          extra: this.props.extra,
          detail: this.props.right[index],
          done: this.done.bind(this)
        });
      }

      if (!this.data.swiping && holdSwipe === false) {
        setTimeout(function () {
          _this5.setData({
            leftPos: 0,
            swiping: false,
            x: 0
          });
        }, 300);
      }
    }
  }
});