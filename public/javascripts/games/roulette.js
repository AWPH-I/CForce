const Roulette = {};

Roulette.current = 0;

Roulette.rollTo = function(num, time = 300) {
    Roulette.show();
    const rand = randRange(3,8);

    const real = (64 * (num - Roulette.current) + 960 * rand);
    const endUp = Number($('#roulette-wheel').css('background-position-x').split('px')[0]) - real;
    const variance = ((Math.floor(Math.random() * (2 - 1 + 1)) + 1 == 1 ? 1 : -1) * Math.random() * 31);

    console.log(real + ' ' + endUp + ' ' + variance);

    $('#roulette-wheel').animate({
        backgroundPositionX: '-=' + (real + variance)
    }, rand * time * 4, 'easeOutSine', function () {
        Roulette.current = num;
        $('#roulette-wheel').animate({
            backgroundPositionX: endUp
            }, 1000, function () {
                Roulette.hide();
        });
    });
}

Roulette.resize = function() {
    $('#roulette-wheel').css('background-position-x', $('#roulette-wheel').width() / 2 - 32);
    Roulette.current = 0;
    Roulette.rollTo(Roulette.lastSpin.result,0);
}

Roulette.show = function() {
    clearInterval(Roulette.hideInterval);
    $('.countdown-sheath').css('display','none');
}

Roulette.hide = function() {
    $('.countdown-sheath').css('display','');
    var x;
    Roulette.hideInterval = setInterval(function() {
        x = (Roulette.lastSpin.time + 24000) - new Date().getTime();
        $('.countdown-clock').text(x);
        if(x <= 0) {
            clearInterval(Roulette.hideInterval);
            $('.countdown-clock').text('0');
        }
    }, 10);
}

$(document).ready(function() {
    $('.bet-btn').click(function() {
        socket.emit('bet-send', {bet: this.getAttribute('bet'), amount: 5} /* <-  credits go here*/);
    });

    Roulette.resize();
    console.log(Roulette.lastSpin);
    Roulette.rollTo(Roulette.lastSpin.result,0);
    Roulette.hide();
});

$(window).resize(function() {
    Roulette.resize();
});


socket.on('roll-receive', function(data) {
    Roulette.lastSpin = data;
    Roulette.rollTo(data.result);
});