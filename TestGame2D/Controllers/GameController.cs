using Bridge.Html5;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TestGame2D.Networking;

namespace TestGame2D
{
    public class GameController
    {
        public static GameController Instance;
        public Camera camera;
        public Map map;
        public Character player;

        //TODO: Migrate logic of player input to controller
        public PlayerController playerController;

        public void Init()
        {
            Instance = this;
            WebSocketController websocket = new WebSocketController();
            websocket.Initialize();

            MapsManager m = new MapsManager();
            playerController = new PlayerController();

            SetMap(0);

            App.OnUpdate += Update;
            App.OnClick += App_OnClick;
        }

        public void SetMap(int mapId)
        {
            if(MapsManager.GetMap(mapId, out MapData map))
            {
                if(this.map != null)
                {
                    GameObject.Destroy(this.map);
                }

                this.map = GameObject.Instantiate<Map>(-9999, map.sizeX / 2, map.sizeY, map.sizeX, map.sizeY, map.resource);
                this.map.order = 0;
            }
        }

        private void App_OnClick(MouseEvent arg1, int arg2, int arg3)
        {
            var clickX = player.PosX + arg2 - camera.camOffsetX;
            var clickY = player.PosY + arg3 - camera.camOffsetY;
            int maxOrder = 0;

            GameObject clicked = null;
            foreach (var item in GameObjectsManager.GetObjects())
            {
                if (Click.Clicked(item.Value, clickX, clickY))
                {
                    if (item.Value.ObjectId == player.ObjectId)
                    {
                        continue;
                    }

                    if (clicked == null)
                    {
                        clicked = item.Value;
                    }

                    if (maxOrder <= item.Value.order)
                    {
                        maxOrder = item.Value.order;
                        clicked = item.Value;
                    }
                }
            }

            if(clicked != null)
            {
                clicked.Click();

                if(clicked.ObjectId == map.ObjectId)
                {
                    SetPlayerDestination(arg2, arg3);
                }
            }
        }

        public void SetPlayer(Character c)
        {
            player = c;
            camera = GameObject.Instantiate<Camera>(-9997, 250, 250, 32, 32, "");
            camera.SetTarget(c);
        }

        public void Update()
        {
            App.ClearContext();

            foreach (var item in GameObjectsManager.GetObjects())
            {
                item.Value.Update();
                if (camera != null)
                {
                    item.Value.Draw(App.Context, camera.PosX - camera.camOffsetX, camera.PosY - camera.camOffsetY);
                }
                else
                {
                    item.Value.Draw(App.Context, item.Value.PosX, item.Value.PosY);
                }
            }
        }

        public class MovePacket
        {
            public int msgId;
            public int x;
            public int y;
        }

        public void SetPlayerDestination(int px, int py)
        {
            var destX = player.PosX + px - camera.camOffsetX;
            var destY = player.PosY + py - camera.camOffsetY;

            if (destX < map.width - player.width && destY < map.height - player.height && 
                destX > 0 + player.width && destY > 0 + player.height)
            {
                PacketSender.Move(destX, destY);
            }
        }
    }
}
