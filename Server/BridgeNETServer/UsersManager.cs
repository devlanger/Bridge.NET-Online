using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BridgeNETServer
{
    public class UsersManager
    {
        public static Dictionary<int, User> users = new Dictionary<int, User>();

        public static bool GetUser(int id, out User user)
        {
            return users.TryGetValue(id, out user);
        }

        public static Dictionary<int, User> GetUsers(HashSet<int> ids)
        {
            Dictionary<int, User> result = users.Where(u => ids.Contains(u.Value.ObjectRefId)).ToDictionary(d => d.Key, d => d.Value);
            return result;
        }

        public static void AddUser(int id, User user)
        {
            users.Add(id, user);
        }

        public static void RemoveUser(int id)
        {
            users.Remove(id);
        }
    }
}
