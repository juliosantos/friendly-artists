var Progress = function (options) {
  this.counter = 0;
  this.upperBound = options.upperBound;
  this.completed = false;
  this.bar = $( "#" + options.barID ).children().first();
};
Progress.prototype.increment = function () {
  this.counter++;
  if (this.bar != undefined) {
    this.bar.width( this.percent() );
  }
  if (this.counter >= this.upperBound) {
    this.complete();
  }
};
Progress.prototype.percent = function () {
  return this.counter * 100 / this.upperBound + "%"
};
Progress.prototype.complete = function () {
  this.completed = true;
  if (this.bar != undefined) {
    this.bar.width( "100%" );
    var that = this;
    setTimeout( function () {
      that.bar.addClass( "bar-success" );
      that.bar.parent().removeClass( "active" );
      that.bar.parent().removeClass( "progress-striped" );
    }, 500 );
  }
};

