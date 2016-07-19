exports.socketChatOn = function(app) {
    app.chatSIO = app.socketIO.of('/chat');
    app.chatSIO.on('connection', function(socket) {
    	socket.emit('chat message', 'socket connet');
        socket.join('chat');
        console.log('a user connected');
        socket.on('chat message', function(msg) {
            console.log('message: ' + msg);
            app.chatSIO.in('chat').emit('chat message', msg);
        });
        socket.on('disconnect', function() {
            console.log('user disconnected');
            socket.emit('chat message', 'socket disconnected');
        });
    });
}
