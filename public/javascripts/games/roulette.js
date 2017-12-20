const Roulette = {};

Roulette.current = 0;

Roulette.rollTo = function(num, time = 300, vary = true) {
    console.log('Rolling' + time + vary);
    Roulette.show();
    const rand = randRange(3,8);

    var real = (64 * (num - Roulette.current) + 960 * rand);
    const endUp = Number($('#roulette-wheel').css('background-position-x').split('px')[0]) - real;
    const posOrNeg = (Math.floor(Math.random() * (2 - 1 + 1)) + 1 == 1 ? 1 : -1);
    const variance = (posOrNeg * Math.random() * 31);

    if(vary) real += variance;

    $('#roulette-wheel').animate({
        backgroundPositionX: '-=' + real
    }, rand * time * 3.5, 'easeOutExpo', function () {
        Roulette.current = num;
        if(vary) {
            $('#roulette-wheel').animate({
                backgroundPositionX: endUp
                }, variance / (posOrNeg * 31) * 800, function () {
                    Roulette.hide();
            });
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
    console.log('Stopped');
    clearInterval(Roulette.clock.interval); 
}

Roulette.clock.format = function(n) {
    n = String(n);
    while(n.length < 5) n = '0' + n;
    return String(n).substring(0,2) + ':' + String(n).substring(2,4);
}

Roulette.clock.restart = function(set) {
    console.log('Restarted');
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

$(document).ready(function() {
    $('.bet-btn').click(function() {
        socket.emit('bet-send', {bet: this.getAttribute('bet'), amount: 5} /* <-  credits go here*/);
    });

    Roulette.resize();
    Roulette.clock.restart(Roulette.lastSpin.time + 20000 - _injTime);
    Roulette.hide();
});

$(window).resize(function() {
    Roulette.resize();
});


socket.on('roll-receive', function(data) {
    console.log('Roll receive');
    Roulette.lastSpin = data;
    Roulette.rollTo(data.result);
    Roulette.clock.restart();
});