Component({
  data: {
    show: true
  },
  props: {
    className: '',
    time: 5000,
    onClose: function onClose() {}
  },
  didMount: function didMount() {
    var _this = this;

    var show = this.data.show;
    var time = this.props.time;
    setTimeout(function () {
      _this.setData({
        show: false
      });
    }, time);
  },
  methods: {
    onClose: function onClose() {
      this.setData({
        show: false
      });
      this.props.onClose();
    }
  }
});