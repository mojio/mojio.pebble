/**
 * Welcome to the Pebble client for Moj.io
 *
 * This is the main entry point for the application
 */

var UI = require('ui');
var mojio = require('mojio');
var geocode = require('geocode');
var utils = require('utils');
var config = require("configuration");
var m = new mojio();
var g = new geocode();
var u = new utils();

var position = {};
var selectedVehiclePosition = {};
var card = new UI.Card({
  title:'moj.io',
  subtitle:'initializing...',
});


// Display the Card
card.show();
Update();

function Update() {
  g.location(function(p) {
    position = p;
    var latlon = position.coords.latitude + "," + position.coords.longitude;
    console.log('location found!!!' + latlon);    
    login();
  }, function(error) {
    login();
  });
  
}

function login() {  
  
  var options = config.getConfig();
  
  if(!options || typeof options == 'undefined' || typeof options.username == 'undefined' ||typeof options.password == 'undefined'  ) {
    card.subtitle('you will need to use your phone to configure this app first!');
  } else {    
    m.login( options.username, options.password, function() {
      card.subtitle('connected to your moj.io account');
      m.vehicles(function(menuItems) {      
        var vehiclesMenu = new UI.Menu({
          sections: [{
            title: 'vehicles',
            items: menuItems
          }],
        });      
        vehiclesMenu.on('select', selectVehicle);
        vehiclesMenu.show();
        card.hide();
      }, function(error) {
        card.subtitle("could not get vehicle information");  
      });
    }, function() {
      card.subtitle("connection failed. update your settings?");
    });
  }
}

function selectVehicle(e) {
  var vehicle = m.vehicleFromName(e.item.title);
        if(vehicle) {
          var lst = [];
          var lat = vehicle.LastLocation.Lat;
          var lng = vehicle.LastLocation.Lng;
          selectedVehiclePosition=vehicle.LastLocation;
          if(position && position.coords && position.coords.latitude) {
            var d = g.distance(position.coords.latitude, position.coords.longitude, lat, lng, "K");
            var display = g.formatDistance(d, "K");
            lst.push({title:"distance away", subtitle:display});
            lst.push({title:"directions", subtitle:"click for directions"});
            
          }
          lst.push({title:"vin", subtitle:vehicle.VIN});
          lst.push({title:"license plate", subtitle:vehicle.LicensePlate});
          lst.push({title:"ignition", subtitle:vehicle.IgnitionOn?"running":"parked"});
          lst.push({title:"last seen", subtitle:new Date(vehicle.LastLocationTime)});
          lst.push({title:"fuel level", subtitle:vehicle.FuelLevel.toString() + "%"});
          if(vehicle.LastOdometer) lst.push({title:"odometer", subtitle:vehicle.LastOdometer.toString()});
          if(vehicle.LastFuelEfficiency) lst.push({title:"fuel efficiency", subtitle:Math.round(vehicle.LastFuelEfficiency,2)});
          var detailsMenu = new UI.Menu({
              sections: [{
                title: e.item.title,
                items: lst
              }],
            });      
            detailsMenu.on("select", loadDirections);
            detailsMenu.show();
          
          m.trips(vehicle._id, 1, 0, function(lastTrip) {
            var root = lastTrip.Data[0];
            var tripLst = [];
            if(root.EndAddress) lst.push({title:"last known location", subtitle:root.EndAddress.Address1});
            lst.push({title:"last trip started", subtitle:new Date(root.StartTime)});
            lst.push({title:"last trip updated", subtitle:new Date(root.LastUpdatedTime)});
            lst.push({title:"last trip ended", subtitle:new Date(root.EndTime)});
            lst.push({title:"last trip max speed", subtitle:Math.round(root.MaxSpeed,2)});
            lst.push({title:"last trip fuel efficiency", subtitle:Math.round(root.FuelEfficiency,2)});
            if(root.StartAddress) lst.push({title:"last trip start location", subtitle:root.StartAddress.Address1});
            lst.concat(tripLst);
            
            var vehicleInfoMenu = new UI.Menu({
              sections: [{
                title: e.item.title,
                items: lst
              }],
            });      
            vehicleInfoMenu.show();
            vehicleInfoMenu.on("select", loadDirections);
            detailsMenu.hide();
          
          }, fail);
        }
}


function loadDirections(e) {
   var title = e.item.title;
  if(title == "directions") {
    g.route(
      "walking", 
      position.coords.latitude + "," + position.coords.longitude, 
      selectedVehiclePosition.Lat + "," + selectedVehiclePosition.Lng, 
      function(d) {
        var directionsLst = [];
        if(d.routes && d.routes[0].legs && d.routes[0].legs[0]) {
          var leg = d.routes[0].legs[0];
          if(leg.distance && leg.distance.text) directionsLst.push({title:"walking distance", subtitle:leg.distance.text});  
          if(leg.duration && leg.duration.text) directionsLst.push({title:"walking duration", subtitle:leg.duration.text});  
          
          if(leg.steps) {
            for(var s in leg.steps) {
              var step = leg.steps[s];
              var title = u.stripHtml(step.html_instructions);
              var subtitle = "";
              if(step.distance && step.distance.text) subtitle = step.distance.text;
              if(step.duration && step.duration.text) subtitle = subtitle + ", " + step.duration.text;
              directionsLst.push({title:title, subtitle:subtitle});  
            }
          }                  
                    
          var directionsMenu = new UI.Menu({
            sections: [{
              title: e.item.title,
              items: directionsLst,
            }],
          });      
          directionsMenu.show();
          directionsMenu.on("select", showDetails);
       }
    }, fail);
              
  }
}

function showDetails(e) {
  var item = e.item;
  var title = item.title;
  var subtitle = item.subtitle;  
  var detailsCard = new UI.Card({
    title:title,
    subtitle:subtitle,
  });
  detailsCard.show();
}


function fail(e) {
  console.log(e);
}
    
    