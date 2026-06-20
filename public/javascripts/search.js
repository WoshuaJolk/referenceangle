
let globalCards = [];

let globalPlaceholders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(el => {
    return {
        src: `/images/placeholders/universal.png`
    }
});

let globalSearch = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(el => {
    return {
        src: '/images/giphy.gif'
    }
});

let globalDataList = JSON.parse(JSON.stringify(globalPlaceholders))

const href = window.location.href.split('?')[0];

function setImages(data) {
    if (data.length > 0) {
        globalDataList = JSON.parse(JSON.stringify(data));
        destroyPagination();
    } else {
        globalDataList = JSON.parse(JSON.stringify(globalPlaceholders));
        destroyPagination();
        $('#errSpace').text('No images matching criteria found. Please try a different combo.')
    }
}

$("#submit-button").click(function () {
    $('#errSpace').text('');
    globalDataList = JSON.parse(JSON.stringify(globalSearch));
    destroyPagination();
    let ageRanger = $('#age-range');
    let ageRange = ageRanger.range('get thumb value', 'second') + '^' + ageRanger.range('get thumb value');
    let genderSelector = $('.radio.checkbox.checked input')[0]
    let gender = genderSelector ? genderSelector.id : 'gender-any';
    let trueChoices = [];
    let falseChoices = [];
    $('.toggleButton').each(function () {
        let button = $(this);
        let state = button.attr('selectState');
        if (state && state == 2) {
            trueChoices.push(button.attr('filterField'));
        } else if (state && state == 3) {
            falseChoices.push(button.attr('filterField'));
        }
    });
    const falseChoicesStr = falseChoices.join('*');
    const trueChoicesStr = trueChoices.join('*');
    let emotion = $('#emotion-dropdown').dropdown('get value');
    let x1 = Math.round(camera.rotation.x / (1 / 180 * Math.PI));
    let y1 = Math.round(camera.rotation.y / (1 / 180 * Math.PI));
    let z1 = Math.round(camera.rotation.z / (1 / 180 * Math.PI));
    let paramString = $.param({
        trueChoices: trueChoicesStr,
        falseChoices: falseChoicesStr,
        gender,
        emotion,
        x1, y1, z1,
        ageRange
    });
    let url = `${href}api/facePoses?${paramString}`;
    gtag('event', 'made search', {
        'event_category': 'na',
        'event_label': 'na',
        'value': paramString
    });
    $.ajax({
        url,
        timeout: 5000,
        success: function (data) {
            setTimeout(() => {
                setImages(data);
            }, 100)
        },
        error: function (error) {
            Sentry.captureException(new Error("Error fetching images from db"));
            globalDataList = [];
            destroyPagination();
            $('#errSpace').text('An error occurred. Please try again later.');
        }
    });
});
