const Roulette = {};

Roulette.current = 0;

socket.emit('update-ui-req', null);

Roulette.rollTo = function(num, time = 300, vary = true) {
    const rand = randRange(5,8);
    var real = (64 * (num - Roulette.current) + 960 * rand);
    
    let endUp, posOrNeg, variance;

    if(vary) {
        endUp = Number($('#roulette-wheel').css('background-position-x').split('px')[0]) - real;
        posOrNeg = (Math.floor(Math.random() * (2 - 1 + 1)) + 1 == 1 ? 1 : -1);
        variance = (posOrNeg * Math.random() * 31);

        real += variance;
        Roulette.show();
    }

    $('#roulette-wheel').animate({
        backgroundPositionX: '-=' + real
    }, rand * time * 3.5, 'easeOutExpo', function () {
        Roulette.current = num;
        if(vary) {
            $('#roulette-wheel').animate({
                backgroundPositionX: endUp
                }, variance / (posOrNeg * 31) * 800, function () {
                    Roulette.hide();
                    Roulette.history.add(num);
            });
            socket.emit('update-ui-req', null);
        } else {
            Roulette.hide();
        }
    });
}

Roulette.resize = function() {
    $('#roulette-wheel').css('background-position-x', $('#roulette-wheel').width() / 2 - 32);
    Roulette.current = 0;
    Roulette.rollTo(Roulette.lastSpin.result, 0, false);
}

Roulette.show = function() {
    $('.countdown-sheath').css('display','none');
    Roulette.clock.stop();
}

Roulette.hide = function() {
    $('.countdown-sheath').css('display','');
}

Roulette.clock = {};

Roulette.clock.stop = function() {
    clearInterval(Roulette.clock.interval); 
}

Roulette.clock.format = function(n) {
    n = String(n);
    while(n.length < 5) n = '0' + n;
    return String(n).substring(0,2) + ':' + String(n).substring(2,4);
}

Roulette.clock.restart = function(set) {
    clearInterval(Roulette.clock.interval);
    Roulette.clock.counter = (set == null ? 20000 : set);
    Roulette.clock.interval = setInterval(function() {
        Roulette.clock.counter -= 10;
        $('.countdown-clock').text(Roulette.clock.format(Roulette.clock.counter));
        if(Roulette.clock.counter <= 0) {
            Roulette.clock.stop();
            $('.countdown-clock').text('00:00');
        }
    }, 10);
}

Roulette.history = {};

Roulette.history.add = function(roll, time = 500) {
    var cl;
    if(roll === 0) {
        cl = '#43A047'; //Green
    } else if(roll % 2 === 0) {
        cl = '#212121'; //Black
    } else if(roll % 2 !== 0) {
        cl = '#E53935'; //Red
    }
    const slots = $('.roulette-history-slot');
    for(var i = slots.length - 2; i >= 0; i --) {
        if($(slots[i]).css('background-color') !== 'rgba(0, 0, 0, 0)') {
            $(slots[i + 1]).animate({
                backgroundColor: $(slots[i]).css('background-color')
            }, {queue: false, duration: time, easing: 'easeInQuad'});
        }
    }

    $(slots[0]).animate({
        backgroundColor: cl
    }, {queue: false, duration: time, easing:'easeInQuad'});
}

$(document).ready(function() {
    $('.bet-btn').click(function() {
        socket.emit('bet-send', {bet: this.getAttribute('bet'), amount: 1} /* <-  credits go here*/);
    });

    Roulette.resize();
    Roulette.clock.restart(Roulette.lastSpin.time + 20000 - _injTime);
    Roulette.hide();
});

$(window).resize(function() {
    Roulette.resize();
});


socket.on('roll-receive', function(data) {
    Roulette.lastSpin = data;
    Roulette.rollTo(data.result);
    Roulette.clock.restart();
});