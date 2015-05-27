/**
 * Welcome to the Pebble client for Moj.io
 *
 * Utitlity functions
 */

var utils = function() {
  this.stripHtml = function(s) {
    return s.replace(/<(?:.|\n)*?>/gm, '');
  };
};

this.exports = utils;