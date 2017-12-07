var socket = io.connect(window.location.href);

socket.on('test', function (data) {
    console.log(data);
});