module.exports = function player(_id, _x, _y) {
  this.id = _id;
  this.x = _x || 150;
  this.y = _y || 150;
  this.size = 10;
  this.speed = 10;
  this.update_position = function(dv) {
    var prev = this.x;
    this.x += dv.x*this.speed;
    this.y += dv.y*this.speed;
  };
};
