const Roulette = {};

Roulette.current = 0;

Roulette.rollTo = function(num, time = 300) {
    Roulette.show();
    const rand = randRange(1,4);

    $('#roulette-wheel').animate({
        backgroundPositionX: '-=' + (64 * (num - Roulette.current) + 960 * rand)
    }, rand * time * Math.random() * 4, function () {
        Roulette.current = num;
        Roulette.hide();
    });
}

Roulette.resize = function() {
    $('#roulette-wheel').css('background-position-x', $('#roulette-wheel').width() / 2 - 32);
}

Roulette.show = function() {
    clearInterval(Roulette.hideInterval);
    $('.countdown-sheath').css('display','none');
}

Roulette.hide = function() {
    $('.countdown-sheath').css('display','');
    Roulette.hideInterval = setInterval(function() {
        $('.countdown-clock').text((Roulette.lastSpin.time + 20000) - new Date().getTime());
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
    Roulette.lastSpin.time = new Date().getTime();
    Roulette.rollTo(data.result);
});