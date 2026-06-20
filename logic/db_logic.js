var keys = require('../keyz.js');

var _ = require('lodash');
var CSV = require('csv-string');
var fs = require('fs');
const { Client } = require('pg');

let clientConfig = {
  bucketUri: 's3://rawimages/',
  baseRetryWait: 0,
  retryWaitMax: 0
};

let awsConfig = {
  region: 'us-west-2',
  accessKeyId: keys.service,
  secretAccessKey: keys.secret
};


const pgClient = new Client({
  host: 'localhost',
  port: 5432,
  user: 'nodeuser',
  password: keys.pgPs,
  database: 'reference-angle'
});

pgClient.connect();

function executeQuery() {
  return function(query, callback) {
    try {
      pgClient.query(query, (err, res) => {
        if (err) {
            console.log(err);
            return callback(err)
        } else {
          return callback(null, res.rows);
        }
      })
    } catch (e) {
       return callback(e)
    }
  }
}

module.exports = executeQuery();
