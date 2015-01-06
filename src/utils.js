var utils = function() {
  this.stripHtml = function(s) {
    return s.replace(/<(?:.|\n)*?>/gm, '');
  };
};

this.exports = utils;