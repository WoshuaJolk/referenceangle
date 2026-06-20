var express = require('express');
var _ = require('lodash');
var returnQueryResults = require('../logic/db_logic.js');
var imagePosesQuery = require('../logic/query.js');
var router = express.Router();
/* GET home page. */

router.get('/facePoses', function(req, res, next) {
        var params = getParams(req);
        var query  = imagePosesQuery(params);
        res.setHeader('Content-Type', 'application/json');
        returnQueryResults(query, (err, resp) => {
            res.send(JSON.stringify(resp))
        });
});

function getParams(req) {
    const pitch = req.query.x1;
    const yaw = req.query.y1;
    const roll = req.query.z1;
    const startAge = req.query.ageRange.split('^')[0]
    const endAge = req.query.ageRange.split('^')[1]
    const gender = req.query.gender.split('-')[1]
    const emotion = req.query.emotion;
    const trueChoices = req.query.trueChoices.split('*');
    const falseChoices = req.query.falseChoices.split('*');
    const age = `lowAge >= ${Number(startAge)} AND highAge <= ${Number(endAge)}`;
    return {
      pitch, yaw, roll, age, gender, trueChoices, falseChoices, emotion
    };
}

module.exports = router;
