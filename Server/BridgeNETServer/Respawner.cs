using System;
using System.Collections.Generic;
using System.Text;

namespace BridgeNETServer
{
    public class RespawnEntity
    {
        public int id;
        public GameObject go;
        public float respawnTime;
    }

    public class Respawner
    {
        public static Respawner Instance;
        public Dictionary<int, RespawnEntity> objectsToRespawn = new Dictionary<int, RespawnEntity>();

        public Respawner()
        {
            Instance = this;
            GameController.Instance.OnUpdate += Instance_OnUpdate;
        }

        public void AddRespawn(RespawnEntity entity)
        {
            objectsToRespawn.Add(entity.id, entity);
            Console.WriteLine("Add resp: " + entity);
        }

        private void Instance_OnUpdate()
        {
            HashSet<int> itemsToRemove = new HashSet<int>();
            foreach (var item in objectsToRespawn)
            {
                if (item.Value.respawnTime < Time.time)
                {
                    GameObjectsManager.AddObject(item.Value.id, item.Value.go);
                    if (MapsManager.GetMap(item.Value.go.mapId, out Map m))
                    {
                        m.AddPlayer(item.Value.id);
                    }

                    itemsToRemove.Add(item.Value.id);
                }
            }

            foreach (var item in itemsToRemove)
            {
                objectsToRespawn.Remove(item);
            }
        }
    }
}
