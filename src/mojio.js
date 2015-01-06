var ajax = require('ajax');

var config = {
  application: '4f03e9e6-7731-4d52-b215-62670be7648c',
  liveSecret: '7da3a567-d884-42b4-b86d-1cd86c5b9b4c',
  sandboxSecret : 'a8dd147d-f377-4941-a1cc-663b082a581e',
  hostname: 'https://api.moj.io',
  port: '80',
  version: 'v1',  
};


var mojio = function() {
  this.config = config;
  this.login = function(userOrEmail, password, success, fail) {
    //POST 
    console.log('in login');
    var loginUrl = this.config.hostname + "/v1/Login/"+this.config.application+"?secretKey="+this.config.liveSecret+"&minutes=43829&userOrEmail="+encodeURIComponent(userOrEmail)+"&password=" + encodeURIComponent(password);    
    console.log(loginUrl);    
    ajax(
      {
        url: loginUrl,
        type: 'json',
        method: 'POST',
      },
      function(data) {
        // Success!
        console.log("Successfully created a session:" + data);
        config.session = data;
        success(this, config.session);
      },
      function(error) {
        // Failure!
        console.log('Failed logging in' + error);
        if(fail) fail(this, error);
      }
    );
  };
  this.vehicleFromName = function(name) {
    for(var v in config.vehicles.Data) {      
      var vehicle = config.vehicles.Data[v];
      if(vehicle.Name == name) return vehicle;
    }
  },
  this.vehicles = function(success, fail) {
    var list = [];

    console.log('in vehicles');
    var url = this.config.hostname + "/v1/Vehicles?limit=10&offset=0&sortBy=Name&desc=false&criteria=";
    console.log(url +", MojioAPIToken:"+ this.config.session._id);    
    ajax(
      {
        url: url,
        headers : {MojioAPIToken: this.config.session._id},
        type: 'json',
      },
      function(data) {
        // Success!
        console.log("Successfully grabbed vehicles:" + data);
        config.vehicles = data;
        for(var v in data.Data) {
          var vehicle = data.Data[v];
          list.push({title:vehicle.Name, subtitle:new Date(vehicle.LastLocationTime)});
        }
        if(success) success(list);
      },
      function(error) {
        // Failure!
        console.log('Failed grabbing vehicles:' +  error);
        if(fail) fail(this, error);
      }
    );
  };
  
  this.trips = function(vehicleid, limit, offset, success, fail) {
    if(typeof limit == 'undefined') limit = 1;
    if(typeof offset == 'undefined') offset = 1;
    
    //https://api.moj.io:443/v1/Trips?limit=1&offset=0&sortBy=StartTime&desc=false&criteria=VehicleId%3Debde9622-6a70-4608-9d06-4634bdb346c2
    console.log('trips');
    var url = this.config.hostname + "/v1/Trips?limit="+limit+"&offset="+offset+"&sortBy=StartTime&desc=false&riteria=VehicleId%3" + vehicleid;
    ajax(
      {
        url: url,
        headers : {MojioAPIToken: this.config.session._id},
        type: 'json',
      },
      function(data) {
        // Success!
        console.log("Successfully grabbed trip data:" + data);
        config.trips = data;
        if(success) success(data);
      },
      function(error) {
        // Failure!
        console.log('Failed grabbing vehicles:' +  error);
        if(fail) fail(this, error);
      }
    );
    
    
  }
  
  
};

this.exports = mojio; 
