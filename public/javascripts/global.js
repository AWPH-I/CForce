const _ = {};

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
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
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

//Only the main socket can handle ui
mainSocket.on('update-ui-res', function(data) {
    console.log(data);
    if(data.balance != null) $('#balance-text').text(data.balance);
});

//Allows all sockets to send errors to the handler
sockets.map(function(e){
    e.on('error-receive', function (data) {
        throwErr(data);
    })
});