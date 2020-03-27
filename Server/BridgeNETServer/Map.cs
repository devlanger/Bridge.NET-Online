using System;
using System.Collections.Generic;
using System.Text;

namespace BridgeNETServer
{
    public class Map
    {
        public int id;
        public HashSet<int> objects = new HashSet<int>();
        public int spawnY;
        public int spawnX;

        public void AddPlayer(int id)
        {
            objects.Add(id);
        }

        public void RemovePlayer(int id)
        {
            objects.Remove(id);
        }
    }
}
