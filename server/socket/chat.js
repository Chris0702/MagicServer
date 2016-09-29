exports.socketChatOn = function(app) {

    function isSocketExistInArray(socket, array) {
        let isExist = false;
        for (let i = 0; i < array.length; i++) {
            if (socket.id == array[i].id) {
                isExist = true;
            }
        }
        return isExist;
    }

    app.chatSIO = app.socketIO.of('/chat');
    app.chatSIO.boyFindGirlWait = [];
    app.chatSIO.girlFindBoyWait = [];
    app.chatSIO.boyFindBoyWait = [];
    let test = 0;
    let roomNameRec = [];

    setInterval(function() {
        // console.log('-------------roomNameRec------------------');
        // console.log(roomNameRec);
        // console.log('-------------boyFindGirlWait.length------------------');
        // console.log(app.chatSIO.boyFindGirlWait.length);
        // console.log('-------------girlFindBoyWait.length------------------');
        // console.log(app.chatSIO.girlFindBoyWait.length);
        // console.log('-------------boyFindBoyWait.length------------------');
        // console.log(app.chatSIO.boyFindBoyWait.length);
        addChatRoom();
        talkWaitStatusForAllWaitSocket();

    }, 4000);

    function addChatRoom() {
        while (app.chatSIO.boyFindGirlWait.length > 0 && app.chatSIO.girlFindBoyWait.length > 0) {
            let boySocket = app.chatSIO.boyFindGirlWait[0];
            let girlSocket = app.chatSIO.girlFindBoyWait[0];
            let roomName = 'boyGirlRoom_' + boySocket.id + '_' + girlSocket.id;
            boySocket.join(roomName);
            girlSocket.join(roomName);
            boySocket.emit('systemMessage', '系統訊息:配對成功，開始聊天!!!');
            girlSocket.emit('systemMessage', '系統訊息:配對成功，開始聊天!!!');
            app.chatSIO.boyFindGirlWait.splice(0, 1);
            app.chatSIO.girlFindBoyWait.splice(0, 1);
            roomNameRec.push(roomName);
        }
        while (app.chatSIO.boyFindBoyWait.length >= 2) {
            let boySocket1 = app.chatSIO.boyFindBoyWait[0];
            let boySocket2 = app.chatSIO.boyFindBoyWait[1];
            let roomName = 'boyBoyRoom_' + boySocket1.id + '_' + boySocket2.id;
            boySocket1.join(roomName);
            boySocket2.join(roomName);
            boySocket1.emit('systemMessage', '系統訊息:配對成功，開始聊天!!!');
            boySocket2.emit('systemMessage', '系統訊息:配對成功，開始聊天!!!');
            app.chatSIO.boyFindBoyWait.splice(0, 2);
            roomNameRec.push(roomName);
        }
    }

    function talkWaitStatusForAllWaitSocket() {
        talkWaitStatusForWaitSocketArray(app.chatSIO.boyFindGirlWait);
        talkWaitStatusForWaitSocketArray(app.chatSIO.girlFindBoyWait);
        talkWaitStatusForWaitSocketArray(app.chatSIO.boyFindBoyWait);
    }

    function talkWaitStatusForWaitSocketArray(waitSocketArray) {
        for (let i = 0; i < waitSocketArray.length; i++) {
            waitSocketArray[i].emit('systemMessage', '系統訊息:你還要等待 ' + (i + 1) + ' 個人');
        }
    }

    function leaveWaitRoomForAllWaitSocket(leaveSocket) {
        leaveWaitRoomForWaitSocketArray(app.chatSIO.boyFindGirlWait, leaveSocket);
        leaveWaitRoomForWaitSocketArray(app.chatSIO.girlFindBoyWait, leaveSocket);
        leaveWaitRoomForWaitSocketArray(app.chatSIO.boyFindBoyWait, leaveSocket);
    }

    function leaveWaitRoomForWaitSocketArray(waitSocketArray, leaveSocket) {
        for (let i = 0; i < waitSocketArray.length; i++) {
            if (waitSocketArray[i].id == leaveSocket.id) {
                waitSocketArray.splice(i, 1);
                i--;
            }
        }
    }

    function removeRoomNameRec(leaveSocket) {
        for (let i = 0; i < roomNameRec.length; i++) {
            if (roomNameRec[i].indexOf(leaveSocket.id) >= 0) {
                roomNameRec.splice(i, 1);
                i--;
            }
        }
    }

    app.chatSIO.on('connection', function(socket) {
        // socket.emit('chat message', 'socket connet');
        socket.emit('systemMessage', '系統訊息:連線成功');
        console.log('a user connected');

        socket.on('findType', function(msg) {
            console.log('find message: '+msg);
            if ((!isSocketExistInArray(socket, app.chatSIO.boyFindGirlWait))&&msg=='boyFindGirl') {
                app.chatSIO.boyFindGirlWait.push(socket);
            }
            else if ((!isSocketExistInArray(socket, app.chatSIO.girlFindBoyWait))&&msg=='girlFindBoy') {
                app.chatSIO.girlFindBoyWait.push(socket);
            }
             else if ((!isSocketExistInArray(socket, app.chatSIO.boyFindBoyWait))&&msg=='boyFindBoy') {
                app.chatSIO.boyFindBoyWait.push(socket);
            }
        });

        socket.on('chatMessage', function(msg) {
            console.log(socket.id);
            console.log('message: ' + msg);
            console.log(socket.rooms);
            for (let room in socket.rooms) {
                socket.to(room).broadcast.emit('chatMessage', msg);
            }
            //socket.broadcast.emit('chat message', msg);
            // app.chatSIO.in('chat').emit('chat message', msg);
        });
        socket.on('disconnect', function() {
            console.log('user disconnected');
            leaveWaitRoomForAllWaitSocket(socket);
            removeRoomNameRec(socket);
            for (let room in socket.rooms) {
                socket.to(room).broadcast.emit('systemMessage', '對方已離開');
            }
            socket.emit('chatMessage', 'socket disconnected');
        });
    });
}
