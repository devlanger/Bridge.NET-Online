using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BridgeNETServer
{
    public class GameObjectsManager
    {
        private static Dictionary<int, GameObject> objects = new Dictionary<int, GameObject>();
        private static int lastId = 1;

        public static int GetNewId()
        {
            return lastId++;
        }

        public static Dictionary<int, GameObject> GetObjects()
        {
            return objects;
        }

        public static List<GameObject> GetObjectsList()
        {
            return objects.Values.ToList();
        }

        public static Dictionary<int, T> GetObjects<T>(HashSet<int> ids) where T : GameObject
        {
            Dictionary<int, T> result = new Dictionary<int, T>();
            foreach (var item in objects.Keys.Intersect(ids).ToHashSet())
            {
                if(objects[item] is T)
                {
                    result.Add(item, objects[item] as T);
                }
            }
            
            return result;
        }

        public static bool GetObject<T>(int id, out T go) where T : GameObject
        {
            if (objects.TryGetValue(id, out GameObject g))
            {
                go = g as T;
                return true;
            }

            go = null;
            return false;
        }

        public static void AddObject(int id, GameObject go)
        {
            if (!objects.ContainsKey(id))
            {
                objects.Add(id, go);
            }
        }

        public static void RemoveObject(int id)
        {
            objects.Remove(id);
        }

        public static void AddObject<T>(T g) where T : GameObject
        {
            int id = GetNewId();
            g.ObjectId = id;
            objects.Add(id, g);
        }
    }
}
