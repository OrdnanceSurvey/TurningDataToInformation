//Require packages and modules
const fs = require('fs');
const Converter = require('csvtojson').Converter;
const async = require('async');
const rp = require('request-promise');
const json2csv = require('json2csv');

//Global vars
//locations global to store gp location data
var locations;
//gps array to store matched data.
var gps = [];

function readPracticeLocation() {
  console.log('Reading HSCIC location data..');
  var converter = new Converter({});
  //end_parsed will be emitted once parsing finished
  converter.on('end_parsed', function(rawGpData) {
    console.log('Finished reading HSCIC location data.');
    locations = rawGpData;
    addXY();
  });
  //read from file
  fs.createReadStream('../../../Data/Source/epraccur_sample.csv').pipe(converter);
}

function addXY() {
  console.log('Now geocoding HSCIC location data against OS Names API');
  async.mapLimit(locations, 50, requestXY, function(err, results) {
    console.log('Finished add XY to HSCIC location data');
    readPracticeInfo();
  });
}

function requestXY(gp, callback) {
  var options = {
    uri: 'https://api.ordnancesurvey.co.uk/opennames/v1/find?key=***REMOVED***',
    qs: {
      query: gp.POSTCODE
    },
    json: true
  };
  rp(options)
    .then(function(response) {
      //update location property
      gp.EASTING = response.results[0].GAZETTEER_ENTRY.GEOMETRY_X;
      gp.NORTHING = response.results[0].GAZETTEER_ENTRY.GEOMETRY_Y;
      callback(null, gp);
    })
    .catch(function(err) {
      console.log('There was an error, skipping ', gp.NAME)
      gp.EASTING = 0;
      gp.NORTHING = 0;
      callback(null, gp);
    });
}

function readPracticeInfo() {
  console.log('Reading HSCIC Practice Info data...');
  var converter = new Converter({});
  //end_parsed will be emitted once parsing finished
  converter.on('end_parsed', function(info) {
    console.log('Finished reading HSCIC Practice Info data.');
    matchData(info);
  });
  fs.createReadStream('../../../Data/Source/General Practice 2014 Practice Level.csv').pipe(converter);
}

function matchData(info) {
  console.log('Matching Practice and Location Data.');
  async.forEachOf(info, function(value, key, callback) {
    for (var i = 0; i < locations.length; i++) {
      if (value.PRAC_CODE !== locations[i].ORGANISATION_CODE) {
        /*do nothing*/
      } else {
        var surgery = {
          ORGANISATION_CODE: locations[i].ORGANISATION_CODE,
          SURGERY_NAME: locations[i].NAME,
          SURGERY_POSTCODE: locations[i].POSTCODE,
          TOTAL_PATIENTS: value.TOTAL_PATIENTS,
          TOTAL_DOCTORS: value.TOTAL_GP_HC,
          RATIO : (value.TOTAL_PATIENTS / value.TOTAL_GP_HC),
          EASTING : locations[i].EASTING,
          NORTHING : locations[i].NORTHING
        };
        gps.push(surgery);
      }
    }
    async.setImmediate(function() {
      callback();
    });
  }, function(err) {
    if (err) {console.error(err.message);}
    console.log('Successfully matched data... Now writing to gp_data.csv.');
    json2csv({data: gps}, function(err, csv) {
      if (err) console.log(err);
      fs.writeFile('gp_data.csv', csv, (err) => {
        if (err) {throw err;}
        console.log('CSV file written, ready to use!!');
      });
    });
  });
}

readPracticeLocation();
