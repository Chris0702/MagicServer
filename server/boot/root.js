module.exports = function(server) {
    // Install a `/` route that returns server status
    var router = server.loopback.Router();
    var path = require('path');

    router.get('/', server.loopback.status());
    router.get('/chat', function(req, res) {
        console.log('send chat.html');
        res.sendFile(path.join(__dirname, '../../client/chat.html'));
    });
     server.use(router);

};
