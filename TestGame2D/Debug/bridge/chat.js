function SendMessage() {
    if (document.getElementById("chatbox-text").value !== "") {
        ws.send(document.getElementById("chatbox-text").value);
        document.getElementById("chatbox-text").value = "";
    }
}

if ("WebSocket" in window) {

    // Let us open a web socket
    var ws = new WebSocket(getConfig().chatIp);

    ws.onopen = function () {
        //ws.send("Message to send");
    };

    ws.onmessage = function (evt) {
        var received_msg = evt.data;
        //alert("Message is received...");
        var date = new Date();
        var time = date.getHours() + ":" + date.getMinutes();
        document.getElementById("chatbox-field").innerHTML += "[" + time + "] " + received_msg + " <br>";
    };

    ws.onclose = function () {

        // websocket is closed.
        alert("Connection is closed...");
    };
} else {

    // The browser doesn't support WebSocket
    alert("WebSocket NOT supported by your Browser!");
}