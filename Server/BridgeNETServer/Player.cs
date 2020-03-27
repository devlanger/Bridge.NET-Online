using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BridgeNETServer
{
    public class Player : Character
    {
        public event Action<int> OnObserve = delegate { };
        public event Action<int> OnUnobserve = delegate { };

        public override void Init()
        {
            base.Init();

            stats[Stat.LVL] = 1;
        }

        public override void Update()
        {
            base.Update();

            UpdateObservedObjects();
            if(mapId == 0 && posX > 800)
            {
                TeleportToMap(1);
            }
            if (mapId == 1 && posX > 800)
            {
                TeleportToMap(0);
            }
        }

        private void TeleportToMap(int newMapId)
        {
            MapsManager.GetMap(mapId, out Map oldMap);
            oldMap.RemovePlayer(ObjectId);

            UsersManager.GetUser(ObjectId, out User user);
            mapId = newMapId;

            MapsManager.GetMap(mapId, out Map newMap);
            newMap.AddPlayer(ObjectId);

            posX = newMap.spawnX;
            posY = newMap.spawnY;

            PacketsSender.TeleportToMap(user, newMapId, posX, posY);
        }

        public void UpdateObservedObjects()
        {
            if (MapsManager.GetMap(mapId, out Map m))
            {
                HashSet<int> removed = Observed.Except(m.objects).ToHashSet();
                HashSet<int> added = m.objects.Except(Observed).ToHashSet();
                removed.Remove(ObjectId);
                added.Remove(ObjectId);

                foreach (var item in removed)
                {
                    OnUnobserve(item);
                    Console.WriteLine("Removed: " + item);
                }


                foreach (var item in added)
                {
                    OnObserve(item);
                    Console.WriteLine("Added: " + item);
                }

                HashSet<int> all = m.objects.ToHashSet();
                all.Remove(ObjectId);

                Observed = all.ToHashSet();
            }
        }
    }
}
