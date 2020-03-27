using System;
using System.Collections.Generic;
using System.Text;

namespace BridgeNETServer
{
    public class MapsManager
    {
        public static Dictionary<int, Map> maps = new Dictionary<int, Map>();

        public MapsManager()
        {
            maps.Add(0, new Map()
            {
                spawnX = 780,
                spawnY = 620,
            });

            maps.Add(1, new Map()
            {
                spawnX = 700,
                spawnY = 900,
            });
        }

        public static bool GetMap(int id, out Map map)
        {
            return maps.TryGetValue(id, out map);
        }
    }
}
