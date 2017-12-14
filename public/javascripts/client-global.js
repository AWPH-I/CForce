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

function error(data) {
    const wrapper = document.createElement('div');
    wrapper.className = 'alert-wrapper';
    $('#main-container').append(wrapper);
    
    const err = document.createElement('div');
    err.className = 'animated bounceIn alert-card alert alert-' + data.type;
    err.innerHTML = '<b>' + data.title + '</b><br>' + data.body;
    
    const close = document.createElement('i');
    close.onclick= function() { 
        var cache = $(this.parentNode.parentNode);
        $(this.parentNode).animateCss('bounceOut', function() {
            cache.remove(); 
        });
    };
    close.className = 'fa fa-times-circle alert-close';

    $(err).append(close);
    $(wrapper).append(err);
}

socket.on('error-receive', function (data) {
    //data.title: short bold title
    //data.body: main msg
    //data.type: warning, success, danger, dark etc
    error(data);
});