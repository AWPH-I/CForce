function handlePOST(url, params) {
    $.post(url, params, (data, status) => {
        if(data.err) {
            throwErr(data.err);
        }

        if(data.redirect) {
            window.location = data.redirect;
        }

        if(data.log) {
            console.log(data.log);
        }
    });
}

function serializeForm(form) {
    return $(form).serializeArray().reduce((obj, item) => {
        obj[item.name] = item.value;
        return obj;
    }, {});
}

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