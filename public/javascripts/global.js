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
    // DO NOT MAKE THIS AN ARROW FUNCTION AS IT CHANGES 'this' TO THE WINDOW
    // NICE ONE JAVASCRIPT
    close.onclick = function() {
        const cache = $(this.parentNode);
        console.log(cache);
        cache.animateCss('bounceOut', () => {
            cache.remove(); 
        });
    };
    close.className = 'fa fa-times-circle alert-close';

    $(err).append(close);
    $('body').append(err);
}

function getSocket(nsp) {
    if(nsp === "") {
        nsp = "/";
    }

    for(var i = 0; i < sockets.length; i ++) {
        if(sockets[i].nsp === nsp) {
            return sockets[i];
        }
    }

    return null;
}

function updateUI(data) {
    if(data.balance != null) {
        $('#balance-text').text(data.balance);
    }
}

mainSocket.on('update-ui', data => {
    updateUI(data);
});

mainSocket.on('err', data => {
    throwErr(data);
});
