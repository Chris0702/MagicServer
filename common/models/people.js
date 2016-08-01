module.exports = function(People) {
    People.findALL = function(callback) {
        People.find(null,
            function(err, posts) {
                callback(null, posts);
            });
    };

    People.remoteMethod(
        'findALL', {
            http: {
                path: '/findALL',
                verb: 'get'
            },
            returns: {
                root: true,
                type: 'object'
            }
        }
    );
};
