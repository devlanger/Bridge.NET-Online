using Bridge;
using Bridge.Html5;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TestGame2D.Managers;

namespace TestGame2D
{
    public class Character : GameObject
    {
        public int TargetId = -1;

        public int DestinationX;
        public int DestinationY;

        public int Speed = 1;

        public bool rotated = false;
        public bool isLocallyObserved = false;

        public Dictionary<Stat, int> stats = new Dictionary<Stat, int>();

        public void SetDestination(int x, int y)
        {
            DestinationX = x;
            DestinationY = y;
        }

        public override void SetPosition(int x, int y)
        {
            base.SetPosition(x, y);
            DestinationX = x;
            DestinationY = y;
        }

        public override void Init()
        {
            base.Init();
            DestinationX = PosX;
            DestinationY = PosY;

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
            UpdateDestination();
        }

        private void UpdateDestination()
        {
            int speed = this.Speed;
            if (PosX != DestinationX)
            {
                if (Math.Abs(DestinationX - PosX) < speed)
                {
                    PosX += (DestinationX > PosX ? 1 : -1);
                }
                else
                {
                    PosX += (DestinationX > PosX ? Speed : -Speed);
                }

                if(rotated && DestinationX < PosX)
                {
                    rotated = false;
                    imageElement.Width = 1;
                }
                else if(!rotated && DestinationX > PosX)
                {
                    rotated = true;
                    imageElement.Width = Math.Abs(imageElement.Width) * -1;
                }
            }

            if (PosY != DestinationY)
            {
                if (Math.Abs(DestinationY - PosY) < speed)
                {
                    PosY += DestinationY > PosY ? 1 : -1;
                }
                else
                {
                    PosY += DestinationY > PosY ? Speed : -Speed;
                }
            }
        }

        public override void Draw(CanvasRenderingContext2D ctx, int offsetX, int offsetY)
        {
            int x = (int)((PosX - this.offsetX) - offsetX);
            int y = (int)((PosY - this.offsetY) - offsetY);

            ctx.FillStyle = HTMLColor.Black;
            ctx.FillRect(x - width, y - height, 100, 5);
            ctx.FillStyle = HTMLColor.Red;
            ctx.FillRect(x - width, y - height, stats[Stat.HEALTH], 5);

            if (!isLocallyObserved)
            {
                base.Draw(ctx, offsetX, offsetY);
            }
            else
            {
                ctx.DrawImage(imageElement, (App.WIDTH / 2) - this.offsetX, (App.HEIGHT / 2) - this.offsetY, width, height);
            }
        }

        public void SetStat(Stat stat, int val)
        {
            stats[stat] = val;

            if(stat == Stat.EXP)
            {
                Script.Call("setExperience", val);
            }

            if (stat == Stat.LVL)
            {
                Script.Call("setLevel", val);
            }
        }
    }
}
