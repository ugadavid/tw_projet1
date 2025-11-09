class AppMain {
  constructor() {
    this.ui = new UIHandlers(this);
    this.manager = new StudentManager(this);
  }

  static init() {
    $(function() {
      new AppMain();
    });
  }
}
