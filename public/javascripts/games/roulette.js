const Roulette = {};

Roulette.rollTo = function(num, time = 300) {
    if(Roulette.rolling) {
        $('#roulette-wheel').stop(false, true);
        $('#roulette-wheel').stop(false, true);
        return Roulette.rollTo(num, time);
    }

    Roulette.rolling = true;
    const rand = randRange(5,8);
    var real = (64 * (num - Roulette.current) + 960 * rand);
    
    var endUp = Number($('#roulette-wheel').css('background-position-x').split('px')[0]) - real;
    var posOrNeg = (Math.floor(Math.random() * (2 - 1 + 1)) + 1 == 1 ? 1 : -1);
    var variance = (posOrNeg * Math.random() * 31);

    real += variance;
    Roulette.show();

    $('#roulette-wheel').animate({
        backgroundPositionX: '-=' + real
    }, {duration: rand * time * 3.5, easing: 'easeOutExpo', done: function () {
        Roulette.current = num;
        $('#roulette-wheel').animate({
            backgroundPositionX: endUp
            }, variance / (posOrNeg * 31) * 600, function () {
                Roulette.hide();
                Roulette.history.add(num);
                mainSocket.emit('update-ui-req', null);
                Roulette.bets.clear();
                Roulette.resize();
                Roulette.rolling = false;
        });
    }});

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
    Roulette.clock.counter = (set == null ? 30000 : set);
    Roulette.clock.tk = Date.now();
    Roulette.clock.interval = setInterval(function() {
        Roulette.clock.counter -= Date.now() - Roulette.clock.tk;
        Roulette.clock.tk = Date.now();
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
    var box = $('.bet-content[bet*="' + data.bet + '"]').find('.chat-username:contains("' + data.username + '")').closest('li');
    if(box.length > 0) {
        var current = $(box.children('.flex-centre').children('.chat-text').children('.amount')).text();
        return $(box.children('.flex-centre').children('.chat-text').children('.amount')).text(Number(current) + data.amount);
    }

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

    const span = document.createElement('span');
    span.className = 'amount';
    $(span).text(data.amount);
    $(p).append(span);

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

Roulette.getColor = function(roll) {
     if(roll === 0) {
        return 'green';
    } else if(roll % 2 === 0) {
        return 'black';
    } else if(roll % 2 !== 0) {
        return 'red';
    }   
}

Roulette.history.add = function(roll, animate = true) {
    const slots = $('.roulette-history-slot:not(.bounceOut)');

    const cache = $($(slots[slots.length - 1]));

    const newSlot = document.createElement('div');
    newSlot.className = 'roulette-history-slot flex-centre';
    newSlot.style.backgroundColor = 'var(--cl-rl-' + Roulette.getColor(roll) + ')';
    const text = document.createElement('p');
    $(text).text(roll); 
    text.className = 'roulette-history-text';
    $(newSlot).append(text);

    if(animate) {
        newSlot.className = newSlot.className + ' animated bounceIn';
        cache.animateCss('bounceOut', function() {
            cache.remove();
            $('#roulette-history').prepend(newSlot);
        });
    } else {
        cache.remove();
        $('#roulette-history').prepend(newSlot);
    }
}

$(window).resize(function() {
    Roulette.resize();
});


gameSocket.on('roll-receive', function(data) {
    console.log('Roll received @ ' + new Date(data.time));
    Roulette.lastSpin = data;
    Roulette.rollTo(data.result);
    Roulette.clock.restart();
});

gameSocket.on('bet-receive', function(data) {
    console.log(data);
    Roulette.bets.display(data);
});

gameSocket.on('bet-approve', function(data) {
    new Audio('sounds/ding.mp3').play();

    var rect = $('.bet-btn[bet="' + data + '"]')[0].getBoundingClientRect();
    var gx = rect.left + (rect.width * Math.random());
    var gy = rect.top + rect.height / 2;

    var from = $('.credit-icon')[0].getBoundingClientRect();
    var fx = from.left + from.width / 2;
    var fy = from.top + from.height / 2;
    var el;

    var num = Math.ceil($('#bet-input').val() / 10) * 10;
    if(num > 100) num = 100;
    for(let i = 0; i < num; i ++) {
        el = document.createElement('i');
        el.className = 'fa fa-diamond flying-diamond';
        el.style.left = fx + 'px';
        el.style.top = fy + 'px';
        $('body').append(el);
        $(el).animate({
            left: gx + 'px',
            top: gy + 'px'
        }, {duration: randRange(50,500), easing: 'easeInCubic', done: function() {
            $(this).remove();
        }});
        gx = rect.left + (rect.width * Math.random()); 
    }
});

$('.bet-btn').click(function() {
    gameSocket.emit('bet-send', {bet: this.getAttribute('bet'), amount: $('#bet-input').val()});
});

//Injection handling
Roulette.lastSpin = _.lastSpin;

for(var i = 0; i < _.history.length; i ++) {
    Roulette.history.add(_.history[i], false);
}

for(var i = 0; i < _.bets.length; i ++) {
    Roulette.bets.display(_.bets[i]);
}

Roulette.current = Roulette.lastSpin.result;

Roulette.resize();
Roulette.clock.restart(Roulette.lastSpin.time + 30000 - _.injTime);
Roulette.hide();

$('.bet-amnt-btn').click(function(e) {
    $('#bet-input').val(e.currentTarget.innerHTML);
});
