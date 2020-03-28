using System;
using System.Collections.Generic;
using System.Text;

namespace BridgeNETServer
{
    public class Portal : GameObject
    {
        public int map = 1;
        public int spawnX = 1;
        public int spawnY = 1;

        public override void Click(User user)
        {
            user.Player.TeleportToMap(map, spawnX, spawnY);
        }
    }
}
