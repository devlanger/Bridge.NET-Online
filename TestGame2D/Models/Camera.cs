using Bridge.Html5;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestGame2D
{
    public class Camera : GameObject
    {
        public Character target;
        public int camOffsetX;
        public int camOffsetY;

        public void SetTarget(Character target)
        {
            this.target = target;
        }

        public override void Init()
        {
            camOffsetX = (App.WIDTH / 2);
            camOffsetY = (App.HEIGHT / 2);
        }

        public override void Update()
        {
            PosX = target.PosX;
            PosY = target.PosY;
        }

        public override void Draw(CanvasRenderingContext2D ctx, int offsetX, int offsetY)
        {
        }
    }
}
