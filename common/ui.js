const ui = {};

ui.fetch = function(socket) {
	if(socket.request.session.user) {
		return {balance: socket.request.session.user.balance};
	}

	return false;
}

ui.update = function(socket) {
	var x = ui.fetch(socket);

	if(x !== false) {
		socket.emit('update-ui', x);
	}
}

module.exports = ui;