using MessagePack;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Text;

namespace BridgeNETServer
{
    public class PacketsSender
    {
        public static void TeleportToMap(User user, int mapId, int x, int y)
        {
            JObject obj = new JObject();
            obj["msgId"] = 4;
            obj["mapId"] = mapId;
            obj["x"] = x;
            obj["y"] = y;

            user.SendData(obj.ToString());
        }

        public static void SpawnGameObject(User user, GameObject go)
        {
            JObject obj = new JObject();
            obj["msgId"] = 0;
            obj["id"] = go.ObjectId;
            obj["bId"] = go.BaseId;
            obj["x"] = go.posX;
            obj["y"] = go.posY;

            user.SendData(obj.ToString());
        }

        public static void DespawnGameObject(User user, int id)
        {
            JObject obj = new JObject();
            obj["msgId"] = 1;
            obj["id"] = id;

            user.SendData(obj.ToString());
        }

        public static void SetStat(User user, int targetId, Stat statId, int val)
        {
            JObject obj = new JObject();
            obj["msgId"] = 5;
            obj["id"] = (int)targetId;
            obj["stat"] = (int)statId;
            obj["val"] = val;

            user.SendData(obj.ToString());
        }
    }
}
