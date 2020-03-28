using System;
using System.Collections.Generic;
using System.Text;

namespace TestGame2D
{
    public class MapsManager
    {
        public static Dictionary<int, MapData> maps = new Dictionary<int, MapData>();

        public MapsManager()
        {
            maps.Add(0, new MapData()
            {
                resource = "https://i.stack.imgur.com/NaUX7.png",
                sizeX = 1000,
                sizeY = 1000
            });

            maps.Add(1, new MapData()
            {
                resource = "https://dat5n5oxdq-flywheel.netdna-ssl.com/wp-content/uploads/2016/02/Map1-e1456506413351.png",
                sizeX = 1000,
                sizeY = 1000
            });

            maps.Add(2, new MapData()
            {
                resource = "https://marketplacecdn.yoyogames.com/images/assets/6148/screenshots/15322_original.jpg?1510917759",
                sizeX = 2000,
                sizeY = 2000
            });
        }

        public static bool GetMap(int id, out MapData map)
        {
            return maps.TryGetValue(id, out map);
        }
    }

    public class MapData
    {
        public int sizeX;
        public int sizeY;
        public string resource;
    }
}
