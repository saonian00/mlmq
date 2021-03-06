import fmtEvent from '../_util/fmtEvent';
Component({
  props: {
    type: 'number',
    className: '',
    focus: false,
    placeholder: '',
    value: '',
    controlled: false
  },
  data: {
    _focus: false
  },
  methods: {
    onInput: function onInput(e) {
      var event = fmtEvent(this.props, e);

      if (this.props.onInput) {
        this.props.onInput(event);
      }
    },
    onConfirm: function onConfirm(e) {
      var event = fmtEvent(this.props, e);

      if (this.props.onConfirm) {
        this.props.onConfirm(event);
      }
    },
    onButtonClick: function onButtonClick() {
      if (this.onButtonClick) {
        this.props.onButtonClick();
      }
    },
    onFocus: function onFocus(e) {
      this.setData({
        _focus: true
      });
      var event = fmtEvent(this.props, e);

      if (this.props.onFocus) {
        this.props.onFocus(event);
      }
    },
    onBlur: function onBlur(e) {
      this.setData({
        _focus: false
      });
      var event = fmtEvent(this.props, e);

      if (this.props.onBlur) {
        this.props.onBlur(event);
      }
    },
    onClearTap: function onClearTap() {
      if (this.props.onClear) {
        this.props.onClear('');
      }
    }
  }
});