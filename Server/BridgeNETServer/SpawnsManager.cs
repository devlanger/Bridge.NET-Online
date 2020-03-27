using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace BridgeNETServer
{
    public class SpawnsManager
    {
        public class SpawnData
        {
            public int id;
            public int x;
            public int y;
            public int time;
            public int map;
            public bool respawnable;
        }

        public SpawnsManager()
        {
            string json = File.ReadAllText("data/spawns.json");
            foreach (var item in JsonConvert.DeserializeObject<SpawnData[]>(json))
            {
                GameObject go = GameObject.Instantiate<Character>(item.x, item.y, item);
                go.BaseId = 1;
                go.mapId = item.map;
                go.respawnable = true;
                go.respawnTime = item.time;

                MapsManager.GetMap(item.map, out Map m);
                m.AddPlayer(go.ObjectId);
            }
        }
    }
}
