function handlePOST(url, params) {
    $.post(url, params, function(data, status){
        if(data.err) {
            throwErr(data.err);
        }

        if(data.redirect) {
            window.location = data.redirect;
        }
    });
}

function serializeForm(form) {
    return $(form).serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});
}

$('form').submit(function(event) {
    console.log($(this));
    console.log(serializeForm(this));
    event.preventDefault();
    handlePOST($(this).attr('action'), serializeForm(this));
});