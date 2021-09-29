Component({
  props: {
    show: true,
    className: '',
    type: 'dialog'
  },
  methods: {
    onCloseTap: function onCloseTap() {
      var onCloseTap = this.props.onCloseTap;

      if (onCloseTap) {
        onCloseTap();
      }
    }
  }
});