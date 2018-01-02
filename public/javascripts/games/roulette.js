const Roulette = {};

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
                    socket.emit('update-ui-req', null);
                    Roulette.bets.clear();
                    Roulette.resize();
            });
        } else {
            Roulette.hide();
        }
    });
}

Roulette.resize = function() {
    $('#roulette-wheel').css('background-position-x', (($('#roulette-wheel').width() / 2 - 32) - 64 * Roulette.current));
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

Roulette.bets = {};

Roulette.bets.display = function(data) {
    const msg = document.createElement('li');
    msg.className = 'chat-message bet-history-entry';

    const img = document.createElement('img');
    img.className = 'chat-avatar rounded-border';
    $(img).attr('src','/images/placeholder-user.png');
    $(msg).append(img);

    const div = document.createElement('div');
    div.className = 'flex-centre';
    div.style = 'width: 100%;';
    $(msg).append(div);

    let p = document.createElement('p');
    p.className = 'chat-text chat-username';
    p.style = 'flex: 2 0 0;';
    $(p).text(data.username);
    $(div).append(p);

    p = document.createElement('p');
    p.className = 'chat-text';
    p.style = 'flex: 1 0 0;';
    $(p).text(data.amount);

    const i = document.createElement('i');
    i.className = 'fa fa-diamond';
    i.ariaHidden = 'true';
    i.style = 'margin-left: .2rem';
    $(p).append(i);
    $(div).append(p);

    $('.bet-content[bet*="' + data.bet + '"]').append(msg);
}

Roulette.bets.clear = function () {
    $('.bet-content').empty();
}

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
    for(let i = slots.length - 2; i >= 0; i --) {
        if($(slots[i]).css('background-color') !== 'rgba(0, 0, 0, 0)') {
            $(slots[i + 1]).animate({
                backgroundColor: $(slots[i]).css('background-color')
            }, {queue: false, duration: time, easing: 'easeInQuad', done: function() {
                if($(slots[i]).children()[0] != null) {
                    $(slots[i + 1]).append($(slots[i]).children()[0]);
                    $($(slots[i]).children()[0]).remove();
                }
            }});
        }
    }

    $($(slots[slots.length - 1]).children()[0]).remove();

    $(slots[0]).animate({
        backgroundColor: cl
    }, {queue: false, duration: time, easing:'easeInQuad', done: function() {
        let p = document.createElement('p');
        p.className = 'roulette-history-text';
        $(p).text(roll);
        $(slots[0]).append(p)
    }});
}

$(window).resize(function() {
    Roulette.resize();
});


socket.on('roll-receive', function(data) {
    Roulette.lastSpin = data;
    Roulette.rollTo(data.result);
    Roulette.clock.restart();
});

socket.on('bet-receive', function(data) {
    console.log(data);
    Roulette.bets.display(data);
});

$('.bet-btn').click(function() {
    socket.emit('bet-send', {bet: this.getAttribute('bet'), amount: 1} /* <-  credits go here*/);
});

//Injection handling
Roulette.lastSpin = _.lastSpin;

for(var i = 0; i < _.spinHistory.length; i ++) {
    Roulette.history.add(_.spinHistory[i], 0);
}

Roulette.current = Roulette.lastSpin.result;

Roulette.resize();
Roulette.clock.restart(Roulette.lastSpin.time + 20000 - _.serverTime);
Roulette.hide();
