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
            maps.Add(0, new Map());
            maps.Add(1, new Map());
            maps.Add(2, new Map());
            maps.Add(3, new Map());
            maps.Add(4, new Map());
        }

        public static bool GetMap(int id, out Map map)
        {
            return maps.TryGetValue(id, out map);
        }
    }
}
