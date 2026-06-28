var _ = require('lodash');

// Allow-lists to constrain values that get interpolated into raw SQL.
var ALLOWED_GENDERS = ['male', 'female', 'any'];
var ALLOWED_EMOTIONS = ['happy', 'sad', 'angry', 'confused', 'disgusted', 'surprised', 'calm', 'any'];
var ALLOWED_CHOICE_FIELDS = ['isSmiling', 'sunGlasses', 'eyeGlasses', 'beard', 'mustache', 'eyesOpen', 'mouthOpen'];

function buildChoicesClause(choices, bool) {
    // Only keep choices whose field name is in the fixed allow-list.
    var safe = _.filter(choices, (choice) => _.includes(ALLOWED_CHOICE_FIELDS, choice));
    if (safe.length === 0) {
        return ``;
    } else {
        var mapped = _.map(safe, (choice) => {
            return `${choice} = ${bool}` } );
        var clauses = _.join(mapped, ' AND ');
        return `AND ${clauses}`;
    }

}



module.exports = function(params) {
let yaw = -Number(params.yaw);
let roll = Number(params.roll);
let pitch = Number(params.pitch);
let genderParam = _.includes(ALLOWED_GENDERS, params.gender) ? params.gender : 'any';
let emotionParam = _.includes(ALLOWED_EMOTIONS, params.emotion) ? params.emotion : 'any';
let gender = genderParam === 'any' ? '5 = 5' : `replace(gender, '"', '') = '${_.capitalize(genderParam)}'`;
let emotion = emotionParam === 'any' ? '5 = 5' : `strpos(emotions, upper('${emotionParam}')) > 0`;
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

