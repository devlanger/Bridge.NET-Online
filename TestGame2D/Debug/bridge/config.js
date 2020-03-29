var getConfig = function () {
    var config = {
        gameIp: 'ws://127.0.0.1:2000/',
        chatIp: 'ws://127.0.0.1:2000/chat'
    };

    return config;
};

var model = [
    {
        "id": 0,
        "resource": "img/player1.png"
    },
    {
        "id": 1,
        "resource": "img/rat.png"
    }
];

var getMobModel = function (index) {
    return model[index];
};