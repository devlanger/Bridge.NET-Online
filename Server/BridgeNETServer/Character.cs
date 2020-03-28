using System;
using System.Collections.Generic;
using System.Text;

namespace BridgeNETServer
{
    public class Character : GameObject
    {
        public float lastAttackTime = 0;

        public Dictionary<Stat, int> stats = new Dictionary<Stat, int>();

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
        }

        public override void Update()
        {
            base.Update();


            if (TargetId != -1)
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
