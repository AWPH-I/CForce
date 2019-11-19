$('.tabbed-pane a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
});

const $btn = $('#signup-button');
if($btn.length > 0) {
    $btn[0].onclick = () => window.location = '/signup';
}

$('form').submit(function(event) {
    event.preventDefault();
    handlePOST($(this).attr('action'), serializeForm(this));
});