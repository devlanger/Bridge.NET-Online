using System;
using System.Collections.Generic;
using System.Text;

namespace BridgeNETServer
{

    public class DbCharacter
    {
        public int id;
        public int accountId;
        public string nickname;
        public int lvl;
        public int exp;
        public int x;
        public int y;
        public int mapId;
    }

    public class DbItem
    {
        public int id;
        public string name;
    }

    public class DbUniqueItem
    {
        public int id;
        public int ownerId;
        public int baseId;
        public int slot;
    }
}
