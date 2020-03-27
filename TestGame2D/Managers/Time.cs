using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestGame2D.Managers
{
    public class Time
    {
        public static float time
        {
            get
            {
                return (float)((float)Environment.TickCount / 1000f); 
            }
        }
    }
}
