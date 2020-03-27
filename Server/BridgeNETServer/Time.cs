using System;
using System.Collections.Generic;
using System.Text;

namespace BridgeNETServer
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
