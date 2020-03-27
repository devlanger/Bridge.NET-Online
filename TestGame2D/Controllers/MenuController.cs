using Bridge.Html5;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestGame2D.Controllers
{
    public class MenuController
    {
        GameObject go;

        public void Init()
        {
            EnterGame();
            return;
            go = GameObject.Instantiate<GameObject>(-999, 200, 200, 200, 200, "img/player1.png");
            go.imageElement.AddEventListener(Bridge.Html5.EventType.Click, (e) =>
            {
                Console.WriteLine("XXXX");

                EnterGame();
            });

            App.OnUpdate += App_OnUpdate;
            App.OnClick += App_OnClick;
        }

        private void App_OnClick(MouseEvent e, int arg1, int arg2)
        {
            if(Click.Clicked(go, arg1, arg2))
            {
                EnterGame();
            }
        }

        private void App_OnUpdate()
        {
            go.Draw(App.Context);
        }

        public void EnterGame()
        {
            App.OnUpdate -= App_OnUpdate;
            App.OnClick -= App_OnClick;

            GameController gameController = new GameController();
            gameController.Init();
        }
    }
}
