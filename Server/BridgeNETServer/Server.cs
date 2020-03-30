using MongoDB.Bson;
using MongoDB.Driver;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using WebSocketSharp;
using WebSocketSharp.Server;

namespace BridgeNETServer
{
    public class User : WebSocketBehavior
    {
        public int ObjectRefId = -1;

        public Player Player
        {
            get
            {
                GameObjectsManager.GetObject(ObjectRefId, out Player p);
                return p;
            }
        }

        public void SendData(string data)
        {
            Send(data);
        }

        protected override void OnMessage(MessageEventArgs e)
        {
            var msg = e.Data;

            dynamic obj = JsonConvert.DeserializeObject(msg);
            int msgId = (int)obj.msgId;
            ReadMessage(msgId, obj);
        }

        private void ReadMessage(int msgId, dynamic obj)
        {
            switch(msgId)
            {
                case 0:
                    int x = (int)obj.x;
                    int y = (int)obj.y;

                    JObject pck = new JObject();
                    pck["msgId"] = 2;
                    pck["id"] = ObjectRefId;
                    pck["x"] = x;
                    pck["y"] = y;

                    var p = Player;
                    p.posX = x;
                    p.posY = y;

                    foreach (var item in UsersManager.GetUsers(Player.Observed))
                    {
                        item.Value.Send(pck.ToString());
                    }

                    Send(pck.ToString());
                    break;
                case 1:
                    if (GameObjectsManager.GetObject((int)obj.id, out GameObject go))
                    {
                        go.Click(this);
                    }
                    break;
                case 2:
                    if (ObjectRefId == -1)
                    {
                        EnterGame((string)obj.hash);
                    }
                    break;
            }
        }

        protected override void OnOpen()
        {
            Console.WriteLine("Player Connected");
        }


        public void EnterGame(string hash)
        {
            Console.WriteLine("Enter game: " + hash);
            MongoCRUD c = new MongoCRUD("bridge-mmo");

            var client = new MongoClient(MongoCRUD.connString);
            var database = client.GetDatabase("bridge-mmo");
            var col = database.GetCollection<dynamic>("sessions");
            var filter = Builders<dynamic>.Filter.Eq("session_hash", hash);

            var sessionData = col.Find(filter).First();
            var accountId = sessionData._id;

            DbCharacter data = c.GetRecordById<DbCharacter>("characters", accountId);
            var DatabaseId = data.id;

            Player p = GameObject.Instantiate<Player>(data.x, data.y);
            p.DatabaseId = DatabaseId;
            ObjectRefId = p.ObjectId;
            p.mapId = data.mapId;
            p.stats[Stat.LVL] = data.lvl;
            p.stats[Stat.EXP] = data.exp;

            if (MapsManager.GetMap(data.mapId, out Map m))
            {
                m.AddPlayer(ObjectRefId);
            }

            p.OnObserve += P_OnObserve;
            p.OnUnobserve += P_OnUnobserve;
            p.OnStatChanged += P_OnStatChanged;
            p.OnSlotChanged += P_OnSlotChanged;

            PacketsSender.SpawnGameObject(this, p);

            JObject pck2 = new JObject();
            pck2["msgId"] = 3;
            pck2["id"] = ObjectRefId;
            pck2["mapId"] = data.mapId;
            pck2["lvl"] = data.lvl;
            pck2["exp"] = data.exp;

            Send(pck2.ToString());

            UsersManager.AddUser(ObjectRefId, this);

            List<DbUniqueItem> inventory = c.GetCharacterItems<DbUniqueItem>(DatabaseId);
            p.SetItems(inventory);

            PacketsSender.SendItems(this, inventory);
        }

        private void P_OnSlotChanged(int arg1, DbUniqueItem arg2)
        {
            PacketsSender.SendItems(this, new List<DbUniqueItem>() { arg2 });
        }

        private void P_OnStatChanged(Stat arg1, int arg2)
        {
            PacketsSender.SetStat(this, ObjectRefId, arg1, arg2);
        }

        private void P_OnUnobserve(int obj)
        {
            PacketsSender.DespawnGameObject(this, obj);
        }

        private void P_OnObserve(int obj)
        {
            if(GameObjectsManager.GetObject(obj, out GameObject go))
            {
                PacketsSender.SpawnGameObject(this, go);
            }
        }

        protected override void OnClose(CloseEventArgs e)
        {
            Console.WriteLine("Player Disconnected " + e.Reason);
            GameObjectsManager.GetObject<Player>(ObjectRefId, out Player p);

            MongoCRUD c = new MongoCRUD("bridge-mmo");
            c.UpdateCharacter(Player);

            p.OnObserve -= P_OnObserve;
            p.OnUnobserve -= P_OnUnobserve;
            p.OnStatChanged -= P_OnStatChanged;

            GameObject.Destroy(p);

            UsersManager.RemoveUser(ObjectRefId);
        }
    }

    public class ChatUser : WebSocketBehavior
    {
        protected override void OnMessage(MessageEventArgs e)
        {
            var msg = e.Data;
            foreach (var item in ChatServer.users)
            {
                item.Value.SendData(ID.Substring(0, 5) + ":" + msg);
            }
        }

        public void SendData(string data)
        {
            Send(data);
        }

        protected override void OnOpen()
        {
            Console.WriteLine("Chat User Connected " + ID + " ip: " + Context.Host);
            ChatServer.users.Add(ID, this);
        }
        protected override void OnClose(CloseEventArgs e)
        {
            Console.WriteLine("Chat User Disconnected " + e.Reason + " " + ID);
            ChatServer.users.Remove(ID);
        }
    }

    public class Server
    {
        public void Start()
        {
            LoadManagers();
            Console.WriteLine("Starting server!");

            var wssv = new WebSocketServer(IPAddress.Parse("0.0.0.0"), 2000);
            wssv.AddWebSocketService<User>("/");
            wssv.AddWebSocketService<ChatUser>("/chat");
            wssv.Start();
            while(true)
            {
                Thread.Sleep(15);
            }
            wssv.Stop();
        }

        class DbUser
        {
            public int id;
            public string username;
            public string password;
        }

        private void LoadManagers()
        {
            var configJson = File.ReadAllText("data/config.json");
            dynamic config = JsonConvert.DeserializeObject(configJson);
            MongoCRUD.connString = config.db_string;

            MapsManager maps = new MapsManager();
            ItemsManager items = new ItemsManager();
            SpawnsManager spawns = new SpawnsManager();
            UsersManager players = new UsersManager();
            GameController game = new GameController();
            Respawner respawner = new Respawner();
        }
    }
}
