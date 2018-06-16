$.fn.extend({
    animateCss: function (animationName, callback) {
        const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
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
    $('.alert-card').remove();
    const err = document.createElement('div');
    err.className = 'animated bounceIn alert-card alert alert-' + data.type;
    err.innerHTML = '<b>' + data.title + '</b><br>' + data.body;
    
    const close = document.createElement('i');
    close.onclick = () => {
        const cache = $(this.parentNode);
        cache.animateCss('bounceOut', () => {
            cache.remove(); 
        });
    };
    close.className = 'fa fa-times-circle alert-close';

    $(err).append(close);
    $('body').append(err);
}

//Only the main socket can handle ui
mainSocket.on('update-ui-res', data => {
    console.log(data);
    if(data.balance != null) $('#balance-text').text(data.balance);
});

//Allows all sockets to send errors to the handler
sockets.map(t => {
    t.on('error-receive', data => {
        throwErr(data);
    });
});