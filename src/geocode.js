var ajax = require('ajax');

var geoCodeConfig = {
  apikey: 'AIzaSyB65sS1_DF5qIxpdzNQHGF1TLB6be1yd-Y',
  hostname: 'https://maps.googleapis.com/maps/api/',
};


var geocode = function() {
  this.location = function(success) {
    if (success && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success);
    }
  },
  this.geocode = function(lat, lng, success, fail) {
    //POST 
    console.log('in geocode');
    var url = geoCodeConfig.hostname + "geocode/json?latlng="+lat+","+lng+"&key=" + geoCodeConfig.apikey;
    console.log(url);    
    ajax(
      {
        url: url,
        type: 'json',
        method: 'get',
      },
      function(data) {
        // Success!
        console.log("Successfully geocoded lat and log:" + data);
        geoCodeConfig.last = data;
        var locationItem ={title:"approx address", subtitle:"Unable to determine the location"};
        if(data && data.results && data.results.length >=0) {
          locationItem = {title:"approx address", subtitle:data.results[0].formatted_address};
        }        
        if(success) success(geoCodeConfig.last, locationItem);
      },
      function(error) {
        // Failure!
        console.log('Failed geocoding' + error);
        if(fail) fail(this, error);
      }
    );
  };
  this.formatDistance = function(distance, unit) {
    if(unit == "K") {
      if(distance < 1) {
        return Math.round((distance * 1000),2) + "m";
      } else {
        return Math.round(distance, 2) + "km";
      }
    }
  },
    
    ////https://developers.google.com/maps/documentation/javascript/directions
  this.route = function(mode, origin, destination, success, fail) {
    //https://maps.googleapis.com/maps/api/directions/json?mode=walking&origin=49.26331,-122.97365&destination=2790 East 1st Avenue, Vancouver, BC, V5M, CA&key=AIzaSyB65sS1_DF5qIxpdzNQHGF1TLB6be1yd-Y
        console.log('in route');
    var url = geoCodeConfig.hostname + "directions/json?mode="+mode+"&origin="+origin+"&destination="+destination+"&key=" + geoCodeConfig.apikey;
    console.log(url);    
    ajax(
      {
        url: url,
        type: 'json',
        method: 'get',
      },
      function(data) {
        // Success!
        console.log("Successfully routed" + data);
        if(success) success(data);
      },
      function(error) {
        // Failure!
        console.log('Failed geocoding' + error);
        if(fail) fail(this, error);
      }
    );
    
  };
    
    
  //http://www.geodatasource.com/developers/javascript
  this.distance = function (lat1, lon1, lat2, lon2, unit) {
    if(typeof unit == 'undefined') unit = "K";
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
//       var radlon1 = Math.PI * lon1/180;
//       var radlon2 = Math.PI * lon2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit=="K") { dist = dist * 1.609344; }
    if (unit=="N") { dist = dist * 0.8684; }
    return dist;
  };
      
};

this.exports = geocode; 
