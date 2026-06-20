
$(document).ready(function(){
    $('#modalTrigger').click(() => {
        gtag('event', 'clicked about site', {
            'event_category': 'na',
            'event_label': 'na',
            'value': 'na'
            });
            $('.ui.sources')
                .modal('show')
        }
    );
});