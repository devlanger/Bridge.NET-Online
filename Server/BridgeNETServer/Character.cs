using System;
using System.Collections.Generic;
using System.Text;

namespace BridgeNETServer
{
    public class Character : GameObject
    {
        public float lastAttackTime = 0;

        public event Action<Stat, int> OnStatChanged = delegate { };

        public override void Click(User user)
        {
            user.Player.TargetId = (int)ObjectId;
        }

        public override void Init()
        {
            base.Init();

            foreach (var item in Enum.GetValues(typeof(Stat)))
            {
                stats.Add((Stat)item, 0);
            }

            stats[Stat.MAX_HEALTH] = 100;
            stats[Stat.HEALTH] = stats[Stat.MAX_HEALTH];
        }

        public override void Update()
        {
            base.Update();

            if (stats[Stat.HEALTH] > 0 && TargetId != -1)
            {
                if (Time.time > lastAttackTime + 1)
                {
                    if (GameObjectsManager.GetObject(TargetId, out Character target))
                    {
                        target.DealDamage(this, 25);
                        lastAttackTime = Time.time;
                    }
                }
            }
        }

        public override void DealDamage(Character attacker, int v)
        {
            if(stats[Stat.HEALTH] <= 0)
            {
                return;
            }

            Console.WriteLine("Attack: " + ObjectId);

            TargetId = attacker.ObjectId;
            attacker.TargetId = -1;

            SetStat(Stat.HEALTH, stats[Stat.HEALTH] - v, true);

            if (stats[Stat.HEALTH] <= 0)
            {
                Die(attacker);
            }
            else
            {
                SetStat(Stat.MAX_HEALTH, stats[Stat.MAX_HEALTH], true);
            }
        }

        protected virtual void Die(Character attacker)
        {
            Destroy(this);
            attacker.TargetId = -1;

            if (attacker is Player)
            {
                attacker.AddStat(Stat.EXP, 40);

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

        public void SetStat(Stat stat, int val, bool sync)
        {
            stats[stat] = val;
            OnStatChanged(stat, val);

            if (sync)
            {
                UpdateObservedObjects();

                foreach (var item in UsersManager.GetUsers(Observed))
                {
                    PacketsSender.SetStat(item.Value, ObjectId, stat, val);
                }
            }
        }

        public void AddStat(Stat stat, int val)
        {
            int v = AfterStatAdd(stat, stats[stat] + val);
            stats[stat] = v;
            OnStatChanged(stat, v);
        }

        private int AfterStatAdd(Stat stat, int val)
        {
            switch(stat)
            {
                case Stat.EXP:
                    if(val >= 100)
                    {
                        val = 0;
                        AddStat(Stat.LVL, 1);
                    }
                    break;
            }

            return val;
        }
    }
}
