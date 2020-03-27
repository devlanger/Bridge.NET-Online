using System;
using System.Collections.Generic;
using Bridge;
using Bridge.Html5;

/// <summary>
/// http://www.websocket.org/echo.html demo written in C# with Bridge.NET
/// </summary>
namespace TestGame2D.Networking
{
    public class WebSocketController
    {
        public static WebSocketController Instance { get; private set; }
        private const string DEFAULT_SERVICE_URI = "ws://echo.websocket.org/";

        public WebSocket Socket { get; set; }

        #region View events

        public void Send(string data)
        {
            if (Socket != null)
            {
                Socket.Send(data);
            }
        }

        private void View_OnDisconnecting(object sender, EventArgs e)
        {
            if (Socket != null)
            {
                Socket.Close(CloseEvent.StatusCode.CLOSE_NORMAL, "User would like to close");
            }
        }

        private void View_OnShuttingUp(object sender, EventArgs e)
        {
            if (Socket != null)
            {
                Socket.Close(CloseEvent.StatusCode.CLOSE_GOING_AWAY, "Shutting up");

                Window.Alert("AWAY");
            }
        }

        #endregion View events

        #region Socket events

        private void OnSocketOpen(Event e)
        {
            //Console.WriteLine("CONNECTED: " + Socket.Url);
        }   

        private void OnSocketClose(CloseEvent e)
        {
            //Console.WriteLine("DISCONNECTED: {Reason: " + e.Reason + ", Code: " + e.Code + ", WasClean: " + e.WasClean + "}");
        }

        private void OnSocketMessage(MessageEvent e)
        {
            //Console.WriteLine(e.Data != null ? e.Data.ToString() : "no reponse data");

            dynamic obj = JSON.Parse(e.Data.ToString());
            int msgId = (int)obj.msgId;
            ReadMessage(msgId, obj);
        }

        private static void ReadMessage(int id, dynamic obj)
        {
            switch(id)
            {
                case 0:
                    int objectId = (int)obj.id;
                    int baseId = (int)obj.bId;
                    int x = (int)obj.x;
                    int y = (int)obj.y;

                    try
                    {
                        var mobModel = Script.Call<dynamic>("getMobModel", baseId);
                        GameObject.Instantiate<Character>(objectId, x, y, 32, 32, mobModel.resource);
                    }
                    catch(Exception ex)
                    {
                        Console.WriteLine("Err:" + objectId);
                        Console.WriteLine(ex.ToString());
                    }
                    break;
                case 1:
                    if(GameObjectsManager.GetObject((int)obj.id, out GameObject go))
                    {
                        GameObject.Destroy(go);
                    }
                    break;
                case 2:
                    if (GameObjectsManager.GetObject((int)obj.id, out Character c))
                    {
                        c.SetDestination((int)obj.x, (int)obj.y);
                    }
                    break;
                case 3:
                    if (GameObjectsManager.GetObject((int)obj.id, out Character pl))
                    {
                        GameController.Instance.SetPlayer(pl);
                    }
                    break;
                case 4:
                    GameController.Instance.SetMap((int)obj.mapId);
                    GameController.Instance.player.SetPosition((int)obj.x, (int)obj.y);
                    break;
                case 5:
                    Stat stat = (Stat)(int)obj.stat;
                    if (GameObjectsManager.GetObject((int)obj.id, out Character t))
                    {
                        t.SetStat(stat, (int)obj.val);
                    }
                    break;
            }
        }

        private void OnSocketError(Event e)
        {
            var error = e["message"];
            //View.LogError(error != null ? error.ToString() : "");
        }

        #endregion Socket events

        public void Initialize()
        {
            Instance = this;

            try
            {
                //Console.WriteLine("Connecting...");
                var config = Script.Call<dynamic>("getConfig");
                Socket = new WebSocket(config.gameIp);

                Socket.OnOpen += OnSocketOpen;
                Socket.OnClose += OnSocketClose;
                Socket.OnMessage += OnSocketMessage;
                Socket.OnError += OnSocketError;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }
    }
}
