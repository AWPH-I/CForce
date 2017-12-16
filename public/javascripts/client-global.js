var socket = io.connect(window.location.href);

$.fn.extend({
    animateCss: function (animationName, callback) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
            if (callback) {
              callback();
            }
        });
        return this;
    }
});

//Both ranges inclusive
function randRange(minimum, maximum) {
    return ((Math.random() * (maximum - minimum + 1) ) << 0) + 1;
}

function throwErr(data) { 
    const err = document.createElement('div');
    err.className = 'animated bounceIn alert-card alert alert-' + data.type;
    err.innerHTML = '<b>' + data.title + '</b><br>' + data.body;
    
    const close = document.createElement('i');
    close.onclick= function() { 
        var cache = $(this.parentNode);
        cache.animateCss('bounceOut', function() {
            cache.remove(); 
        });
    };
    close.className = 'fa fa-times-circle alert-close';

    $(err).append(close);
    $('body').append(err);

    if($('.alert-card').length > 3) {
        $('.alert-card')[0].remove();
    }
}

socket.on('error-receive', function (data) {
    throwErr(data);
});