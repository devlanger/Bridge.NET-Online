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

        public class PortalData
        {
            public int id;
            public int x;
            public int y;
            public int spawnX;
            public int spawnY;
            public int map;
            public int targetMap;
        }

        public SpawnsManager()
        {
            string portalsJson = File.ReadAllText("data/portals.json");
            foreach (var item in JsonConvert.DeserializeObject<PortalData[]>(portalsJson))
            {
                Portal go = GameObject.Instantiate<Portal>(item.x, item.y);
                go.BaseId = 2;
                go.mapId = item.map;
                go.map = item.targetMap;
                go.spawnX = item.spawnX;
                go.spawnY = item.spawnY;

                MapsManager.GetMap(item.map, out Map m);
                m.AddPlayer(go.ObjectId);
            }

            string json = File.ReadAllText("data/spawns.json");
            foreach (var item in JsonConvert.DeserializeObject<SpawnData[]>(json))
            {
                GameObject go = GameObject.Instantiate<Character>(item.x, item.y, item);
                go.BaseId = item.id;
                go.mapId = item.map;
                go.respawnable = true;
                go.respawnTime = item.time;

                MapsManager.GetMap(item.map, out Map m);
                m.AddPlayer(go.ObjectId);
            }
        }
    }
}
