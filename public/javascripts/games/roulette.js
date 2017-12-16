var Roulette = {};

Roulette.current = 0;

Roulette.rollTo = function(num) {
    var rand = randRange(1,4);

    $('#roulette-wheel').animate({
        backgroundPositionX: '-=' + (64 * (num - Roulette.current) + 960 * rand)
    }, rand * 200 * Math.random() * 4, function () {
        Roulette.current = num;
    });
}

Roulette.resize = function() {
    $('#roulette-wheel').css('background-position-x', $('#roulette-wheel').width() / 2 - 32);
}

$(document).ready(function() {
    $('.bet-btn').click(function() {
        socket.emit('bet-send', {bet: this.getAttribute('bet'), amount: 5} /* <-  credits go here*/);
    });

    Roulette.resize();
});

$(window).resize(function() {
    Roulette.resize();
});


socket.on('roll-receive', function(data) {
    Roulette.rollTo(data.roll);
});