using System;
using System.Collections.Generic;
using System.Text;

namespace BridgeNETServer
{
    public class ItemsManager
    {
        public static Dictionary<int, DbItem> items = new Dictionary<int, DbItem>();

        public ItemsManager()
        {
            MongoCRUD c = new MongoCRUD("bridge-mmo");
            foreach (var item in c.GetRecords<DbItem>("items"))
            {
                items.Add(item.id, item);
            }
        }

        public static bool GetItem(int id, out DbItem item)
        {
            return items.TryGetValue(id, out item);
        }
    }
}
