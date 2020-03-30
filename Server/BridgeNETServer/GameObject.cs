using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;

namespace BridgeNETServer
{
    public class GameObject
    {
        public int mapId;
        public int posX;
        public int posY;
        public int TargetId = -1;

        public int Health = 100;
        public int respawnTime = 30;
        public bool respawnable = false;

        public int ObjectId { get; set; }
        public int BaseId { get; set; } = 0;

        public HashSet<int> Observed = new HashSet<int>();

        public event Action<int> OnObserve = delegate { };
        public event Action<int> OnUnobserve = delegate { };

        public Dictionary<Stat, int> stats = new Dictionary<Stat, int>();

        public static T Instantiate<T>(int x, int y, SpawnsManager.SpawnData data = null) where T : GameObject, new()
        {
            T g = new T();
            GameObjectsManager.AddObject(g);
            g.SetPosition(x, y);
            if (data != null)
            {
                g.SetData(data);
            }

            g.Init();
            return g;
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

        private void SetData(SpawnsManager.SpawnData data)
        {

        }

        public virtual void Click(User user)
        {

        }

        public virtual void DealDamage(Character attacker, int v)
        {
        }

        private void SetPosition(int x, int y)
        {
            this.posX = x;
            this.posY = y;
        }

        public virtual void Init()
        {

        }

        public virtual void Update()
        {

        }

        public static void Destroy(GameObject g)
        {
            GameObjectsManager.RemoveObject(g.ObjectId);

            if (MapsManager.GetMap(g.mapId, out Map m))
            {
                m.RemovePlayer(g.ObjectId);
            }
        }
    }
}
