import * as querystring from 'querystring';
import * as https from 'https';
var OpenWeatherJsonNodeResponseAttribute;
(function (OpenWeatherJsonNodeResponseAttribute) {
    OpenWeatherJsonNodeResponseAttribute[OpenWeatherJsonNodeResponseAttribute["main"] = 0] = "main";
    OpenWeatherJsonNodeResponseAttribute[OpenWeatherJsonNodeResponseAttribute["weather"] = 1] = "weather";
    OpenWeatherJsonNodeResponseAttribute[OpenWeatherJsonNodeResponseAttribute["nonode"] = 2] = "nonode";
})(OpenWeatherJsonNodeResponseAttribute || (OpenWeatherJsonNodeResponseAttribute = {}));
var OpenWeatherJsonResponseAttribute;
(function (OpenWeatherJsonResponseAttribute) {
    OpenWeatherJsonResponseAttribute[OpenWeatherJsonResponseAttribute["temp"] = 0] = "temp";
    OpenWeatherJsonResponseAttribute[OpenWeatherJsonResponseAttribute["pressure"] = 1] = "pressure";
    OpenWeatherJsonResponseAttribute[OpenWeatherJsonResponseAttribute["humidity"] = 2] = "humidity";
    OpenWeatherJsonResponseAttribute[OpenWeatherJsonResponseAttribute["description"] = 3] = "description";
    OpenWeatherJsonResponseAttribute[OpenWeatherJsonResponseAttribute["noattribute"] = 4] = "noattribute";
})(OpenWeatherJsonResponseAttribute || (OpenWeatherJsonResponseAttribute = {}));
export class Weather {
    constructor() {
        // properties 
        this._defaultCity = 'Bergamo';
        this._city = this._defaultCity;
        this._cityId = null;
        this._zip = null;
        this._units = 'metric';
        this._language = 'it';
        this._format = 'json';
        this._APPID = null;
        this._latitude = null;
        this._longitude = null;
        this._options = {
            host: 'api.openweathermap.org',
            path: '/data/2.5/weather?' + querystring.stringify({ q: this._defaultCity }),
            withCredentials: false
        };
    }
    // set methods 
    setLang(language) {
        this._language = language;
    }
    setCity(city) {
        this._city = encodeURIComponent(city.toLowerCase());
    }
    setCoordinate(latitude, longitude) {
        this._latitude = latitude;
        this._longitude = longitude;
    }
    ;
    setCityId(cityid) {
        this._cityId = cityid;
    }
    ;
    setZipCode(zip) {
        this._zip = zip;
    }
    ;
    setUnits(units) {
        this._units = units.toLowerCase();
    }
    ;
    setAPPID(appid) {
        this._APPID = appid;
    }
    ;
    // get method 
    getLang() {
        return this._language;
    }
    ;
    getCity() {
        return this._city;
    }
    ;
    getCoordinate() {
        return {
            "latitude": this._latitude,
            "longitude": this._longitude
        };
    }
    ;
    getCityId() {
        return this._cityId;
    }
    ;
    getZipCode() {
        return this._zip;
    }
    ;
    getUnits() {
        return this._units;
    }
    ;
    getFormat() {
        return this._format;
    }
    ;
    getAPPID() {
        return this._APPID;
    }
    ;
    getTemperature(callback) {
        this.getWeatherByNodeAndAttribute(callback, 'main', 'temp');
    }
    ;
    getPressure(callback) {
        this.getWeatherByNodeAndAttribute(callback, 'main', 'pressure');
    }
    ;
    getHumidity(callback) {
        this.getWeatherByNodeAndAttribute(callback, 'main', 'humidity');
    }
    ;
    getDescription(callback) {
        this.getWeatherByNodeAndAttribute(callback, 'weather', 'description');
    }
    ;
    getAllWeather(callback) {
        this.getWeatherByNodeAndAttribute(callback, 'nonode', 'noattribute');
    }
    ;
    getWeatherForecast(callback) {
        this.getForecast(callback);
    }
    ;
    /*
    getWeatherForecastForDays(days, callback) {
      getData(buildPathForecastForDays(days), callback);
    };
  
    getWeatherForecastForHours(hours, callback) {
      getData(buildPathForecastForHours(hours), callback);
    };
  
    getSmartJSON(callback) {
      getSmart(callback);
    };
    */
    // private methods
    getWeatherByNodeAndAttribute(callback, node, attribute) {
        this.getData(this.buildWeatherUrl(), (err, jsonResponse) => {
            if (err) {
                return callback(err, null);
            }
            else {
                // nonode noattribute return all the json response 
                if (node == 'nonode') {
                    const t = jsonResponse;
                    return callback(null, t);
                }
                const objNode = jsonResponse[node];
                if (objNode != undefined) {
                    // openweather returned the data check for weather array (the only different)
                    let objValue;
                    if (node == 'weather') {
                        // get first element 
                        objValue = objNode[0][attribute];
                    }
                    else {
                        // get attribute 
                        objValue = objNode[attribute];
                    }
                    return callback(null, objValue);
                }
                else {
                    // openweather returned an error response eg. {"cod":401,"message":"Invalid API key ... 
                    return callback(new Error(jsonResponse.message), null);
                }
            }
        });
    }
    getForecast(callback) {
        this.getData(this.buildForecastUrl(), (err, jsonResponse) => {
            const t = jsonResponse;
            return callback(err, t);
        });
    }
    getQueryByBestLocationDetail() {
        let locationQuery;
        // By cityId
        if (this._city) {
            locationQuery = {
                q: this._city
            };
        }
        if (this._cityId) {
            locationQuery = {
                id: this._cityId
            };
        }
        if (this._zip) {
            locationQuery = {
                zip: this._zip
            };
        }
        if (this._latitude && this._longitude) {
            locationQuery = {
                lat: this._latitude,
                lon: this._longitude
            };
        }
        return querystring.stringify(locationQuery);
    }
    buildWeatherUrl() {
        // build the URL 
        const url = '/data/2.5/weather?'
            + this.getQueryByBestLocationDetail()
            + '&'
            + querystring.stringify({
                units: this._units,
                lang: this._language,
                mode: this._format,
                APPID: this._APPID
            });
        return url;
    }
    buildForecastUrl() {
        const url = '/data/2.5/forecast?'
            + this.getQueryByBestLocationDetail()
            + '&'
            + querystring.stringify({
                units: this._units,
                lang: this._language,
                mode: this._format,
                APPID: this._APPID
            });
        return url;
    }
    getData(url, callback) {
        this._options.path = url;
        let connection = https.get(this._options, (res) => {
            let chunks = ``;
            let parsed = {};
            res.on('data', (chunk) => {
                chunks += chunk;
            });
            res.on('end', () => {
                try {
                    return callback(null, JSON.parse(chunks));
                }
                catch (err) {
                    return callback(err, null);
                }
            });
            res.on('error', (err) => {
                return callback(err, null);
            });
        });
        connection.on('error', (err) => {
            return callback(err, null);
        });
    }
}
/* (function(){

  var config = {
    city : 'Fairplay',
    units : 'metric',
    lan : 'it',
    format : 'json',
    APPID : null,
    ssl: false
  };

  // main settings
  var http = require('http');
  var https = require('https');
  var querystring = require('querystring');
  var options = {
    host : 'api.openweathermap.org',
    path: '/data/2.5/weather?' + querystring.stringify({q: 'fairplay'}),
    withCredentials: false
  };

  var weather = exports;

  // weather(set)  ----------------------------  weather(set)  -----------------------------
  weather.setLang = function(lang){
    config.lan = lang.toLowerCase();
  };

  weather.setCity = function(city){
    config.city = encodeURIComponent(city.toLowerCase());
  };

  weather.setCoordinate = function(latitude, longitude){
    config.latitude = latitude;
    config.longitude = longitude;
  };

  weather.setCityId = function(cityid){
    config.cityId = cityid;
  };

  weather.setZipCode = function(zip){
    config.zip = zip;
  };

  weather.setUnits = function(units){
    config.units = units.toLowerCase();
  };

  weather.setAPPID = function(appid){
    config.APPID = appid;
  };
  weather.setSsl = function(ssl){
    config.ssl = ssl;
  };

  // weather(get)  ------------------------------  weather(get)  -------------------------------
  weather.getLang = function(){
    return config.lan;
  };

  weather.getCity = function(){
    return config.city;
  };

  weather.getCoordinate = function(){
    return {
      "latitude": config.latitude,
      "longitude": config.longitude
    };
  };

  weather.getCityId = function(){
    return config.cityId;
  };

  weather.getZipCode = function(){
    return config.zip;
  };

  weather.getUnits = function(){
    return config.units;
  };

  weather.getFormat = function(){
    return config.format;
  };

  weather.getError = function(callback){
     getErr(callback);
  };

  weather.getAPPID = function(){
    return config.APPID;
  };

  weather.getSsl = function(){
    return config.ssl;
  };

  // get temperature
  weather.getTemperature = function(callback){
    getTemp(callback);
  };

  // get the atmospheric pressure
  weather.getPressure = function(callback){
    getPres(callback);
  };

  weather.getHumidity = function(callback){
    getHum(callback);
  };

  weather.getDescription = function(callback){
    getDesc(callback);
  };

  weather.getAllWeather = function(callback){
    getData(buildPath(), callback);
  };

  weather.getWeatherForecast = function(callback){
    getData(buildPathForecast(), callback);
  };

  weather.getWeatherForecastForDays = function(days, callback){
    getData(buildPathForecastForDays(days), callback);
  };

  weather.getWeatherForecastForHours = function(hours, callback){
    getData(buildPathForecastForHours(hours), callback);
  };

  weather.getSmartJSON = function(callback){
    getSmart(callback);
  };

  // active functions()  ---------------------  active functions()  -----------------------
  function getHttp(){
    return options.ssl ? https : http;
  }

  function getErr(callback){
    // set new path to throw the http exception
    options.path = 'timetocrash';
    getHttp().get(options, function(err,data){
      return callback(err,data);
    });
  }

  function getPres(callback){
    getData(buildPath(), function(err,jsonObj){
      return callback(err,jsonObj.main.pressure);
    });
  }

  function getTemp(callback){
    getData(buildPath(), function(err,jsonObj){
      return callback(err,jsonObj.main.temp);
    });
  }

  function getHum(callback){
    getData(buildPath(), function(err,jsonObj){
      return callback(err,jsonObj.main.humidity);
    });
  }

  function getDesc(callback){
    getData(buildPath(), function(err,jsonObj){
      return callback(err, (jsonObj.weather)[0].description);
    });
  }

  function getSmart(callback){
    getData(buildPath(), function(err,jsonObj){
      var smartJSON = {};
      smartJSON.temp = jsonObj.main.temp;
      smartJSON.humidity = jsonObj.main.humidity;
      smartJSON.pressure = jsonObj.main.pressure;
      smartJSON.description = ((jsonObj.weather[0]).description);
      smartJSON.weathercode = ((jsonObj.weather[0]).id);

      // return the rain in mm if present
      if(jsonObj.precipitation){
        smartJSON.rain = jsonObj.precipitation.value;
      }else {
        smartJSON.rain = 0;
      }

      if(jsonObj.rain){
        var rain3h = jsonObj.rain;
        smartJSON.rain = Math.round(rain3h['3h'] / 3);
      }

      return callback(err,smartJSON);
    });
  }

  function getCoordinate(){
    var coordinateAvailable = config.latitude && config.longitude;
    var cityIdAvailable = config.cityId;
    var coordinateQuery = {q: config.city};
    if (cityIdAvailable) coordinateQuery = {id: config.cityId};
    if (config.zip) coordinateQuery = {zip: config.zip};
    else if (coordinateAvailable) coordinateQuery = {lat: config.latitude, lon: config.longitude};
    return querystring.stringify(coordinateQuery);
  }

  function buildPath(){
    return '/data/2.5/weather?' + getCoordinate()
      + '&'
      + querystring.stringify({units: config.units, lang: config.lan, mode: 'json', APPID: config.APPID});
  }

  function buildPathForecast(){
    return '/data/2.5/forecast?'
      + getCoordinate()
      + '&'
      + querystring.stringify({units: config.units, lang: config.lan, mode: 'json', APPID: config.APPID});
  }

  function buildPathForecastForDays(days){
    return '/data/2.5/forecast/daily?'
      + getCoordinate()
      + '&'
      + querystring.stringify({cnt: days, units: config.units, lang: config.lan, mode: 'json', APPID: config.APPID});
  }

  function buildPathForecastForHours(hours) {
      return '/data/2.5/forecast/hourly?'
        + getCoordinate()
        + '&'
        + querystring.stringify({cnt: hours, units: config.units, lang: config.lan, mode: 'json', APPID: config.APPID});
  }

  function getData(url, callback, tries){
    options.path = url;
    var conn = getHttp().get(options, function(res){
      var chunks = '';
      res.on('data', function(chunk) {
          chunks += chunk;
      });
      res.on('end', function () {
          var parsed = {};

          if (!chunks && (!tries || tries < 3)) {
              return getData(url, callback, (tries||0)+1);
          }

          // Try-Catch added by Mikael Aspehed
          try{
            parsed = JSON.parse(chunks);
          }catch(e){
            parsed = {error:e};
          }

          return callback(null,parsed);
      });

      res.on('error', function(err){
          return callback(err, null);
      });
    });

    conn.on('error', function(err){
      return callback(err, null);
    });
  }

})();
*/ 
