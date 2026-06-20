var _ = require('lodash');

function buildChoicesClause(choices, bool) {
    if (choices.length === 0 || choices[0].length < 2) {
        return ``;
    } else {
        var mapped = _.map(choices, (choice) => {
            return `${choice} = ${bool}` } );
        var clauses = _.join(mapped, ' AND ');
        return `AND ${clauses}`;
    }

}



module.exports = function(params) {
let yaw = -Number(params.yaw);
let roll = Number(params.roll);
let pitch = Number(params.pitch);
let gender = params.gender === 'any' ? '5 = 5' : `replace(gender, '"', '') = '${_.capitalize(params.gender)}'`;
let emotion = params.emotion === 'any' ? '5 = 5' : `strpos(emotions, upper('${params.emotion}')) > 0`;
let age = params.age;
let positiveChoices = buildChoicesClause(params.trueChoices, 'true');
let falseChoices = buildChoicesClause(params.falseChoices, 'false');
  return `
 
  SELECT 
   url as src
  FROM (
    SELECT 
        url, 
        pitchDiff + yawDiff + rollDiff as dist
    FROM (
        SELECT 
          CASE when pitch > ${pitch} then pitch - ${pitch} else ${pitch}-pitch END as pitchDiff,
          CASE when yaw > ${yaw} then yaw - ${yaw} else ${yaw}-yaw END as yawDiff,
          CASE when roll > ${roll} then roll - ${roll} else ${roll}-roll END as rollDiff, 
          url,
           src
        FROM (
            SELECT 
                pitch, 
                yaw,
                roll, 
                replace(url, '"', '') as url, 
                'a'
            AS src 
            FROM reference
            WHERE roll is not null
            AND ${emotion}
            AND ${age}
            AND ${gender}
            ${positiveChoices}
             ${falseChoices}
        ) AS sub1
 ) AS sub2
 ) AS sub3
 order by dist asc limit 200
  `;
};

