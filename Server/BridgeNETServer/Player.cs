using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BridgeNETServer
{
    public class Player : Character
    {
        public int DatabaseId;

        public Dictionary<int, DbUniqueItem> items = new Dictionary<int, DbUniqueItem>();
        public event Action<int, DbUniqueItem> OnSlotChanged = delegate { };

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
        }

        public void TeleportToMap(int newMapId, int posX, int posY)
        {
            MapsManager.GetMap(mapId, out Map oldMap);
            oldMap.RemovePlayer(ObjectId);

            UsersManager.GetUser(ObjectId, out User user);
            mapId = newMapId;

            MapsManager.GetMap(mapId, out Map newMap);
            newMap.AddPlayer(ObjectId);

            this.posX = posX;
            this.posY = posY;

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
                }


                foreach (var item in added)
                {
                    OnObserve(item);
                }

                HashSet<int> all = m.objects.ToHashSet();
                all.Remove(ObjectId);

                Observed = all.ToHashSet();
            }
        }

        public void SetItems(List<DbUniqueItem> inventory)
        {
            foreach (var item in inventory)
            {
                this.items.Add(item.slot, item);
            }
        }

        public void UpdateItemSlot(int slot, DbUniqueItem item)
        {
            if(!items.ContainsKey(slot))
            {
                items.Add(slot, null);
            }

            this.items[slot] = item;
            OnSlotChanged(slot, item);
        }

        public void AddNewItem(DbUniqueItem item)
        {
            int freeSlot = GetFreeInventorySlot();

            if (freeSlot != -1)
            {
                item.slot = freeSlot;
                UpdateItemSlot(freeSlot, item);
            }
        }

        public int GetFreeInventorySlot()
        {
            int slot = -1;
            for (int i = 0; i < 20; i++)
            {
                if (items.ContainsKey(i))
                {
                    continue;
                }

                slot = i;
                break;
            }

            return slot;
        }
    }
}
