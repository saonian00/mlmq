import fmtEvent from '../_util/fmtEvent';
Component({
  props: {
    value: '',
    checked: false,
    disabled: false,
    onChange: function onChange() {},
    id: ''
  },
  methods: {
    onChange: function onChange(e) {
      var event = fmtEvent(this.props, e);
      this.props.onChange(event);
    }
  }
});