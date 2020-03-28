using System;
using System.Collections.Generic;
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

        private void SetData(SpawnsManager.SpawnData data)
        {

        }

        public virtual void Click(User user)
        {

        }

        public virtual void DealDamage(Character attacker, int v)
        {
            Console.WriteLine("Attack: " + ObjectId);

            Health -= v;

            if (Health <= 0)
            {
                Destroy(this);
                attacker.AddStat(Stat.EXP, 40);
                attacker.TargetId = -1;

                if (attacker is Player)
                {
                    int rand = new Random().Next(0, 4);
                    //if (rand == 1)
                    //{
                        ((Player)attacker).AddNewItem(new DbUniqueItem()
                        {
                            ownerId = attacker.ObjectId,
                            baseId = 1
                        });
                    //}
                }

                Respawner.Instance.AddRespawn(new RespawnEntity()
                {
                    id = ObjectId,
                    go = this,
                    respawnTime = Time.time + respawnTime
                });
            }
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
