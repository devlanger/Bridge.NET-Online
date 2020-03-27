using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;

namespace BridgeNETServer
{
    public class GameController
    {
        public static GameController Instance;
        public Thread update;

        public event Action OnUpdate = delegate { };

        public GameController()
        {
            Instance = this;
            update = new Thread(new ThreadStart(Update));
            update.Start();
        }

        private void Update()
        {
            while (true)
            {
                Thread.Sleep(100);

                foreach (var item in GameObjectsManager.GetObjectsList())
                {
                    item.Update();
                }

                OnUpdate();
            }
        }
    }
}
