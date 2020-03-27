using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestGame2D
{
    public class Click
    {
        public static bool Clicked(GameObject go, int x, int y)
        {
            if (x > go.PosX - go.offsetX && x < go.PosX - go.offsetX + go.width && y > go.PosY - go.offsetY && y < go.PosY - go.offsetY + go.height)
            {
                return true;
            }

            return false;
        }
    }
}
