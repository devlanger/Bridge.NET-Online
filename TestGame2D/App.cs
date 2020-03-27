using Bridge;
using Bridge.Html5;
using System;
using TestGame2D.Controllers;

namespace TestGame2D
{
    public class App
    {
        public static HTMLCanvasElement Canvas { get; private set; }
        public static CanvasRenderingContext2D Context { get; private set; }    

        public const int WIDTH = 1600;
        public const int HEIGHT = 900;

        public static event Action<MouseEvent, int, int> OnClick = delegate { };
        public static event Action OnUpdate = delegate { };
        public static event Action OnServerUpdate = delegate { };

        public App()
        {
            App.Canvas = (HTMLCanvasElement)Document.GetElementById("canvas");
            App.Context = (CanvasRenderingContext2D)Canvas.GetContext("2d");

            App.Canvas.AddEventListener("click", e => GetMousePosition(App.Canvas, e));
        }
        public void ServerUpdate()
        {
            Window.SetTimeout(() =>
            {
                Update();
                OnUpdate();
            }, 100);
        }

        public void GetMousePosition(HTMLCanvasElement c, Event e)
        {
            var rect = (ClientRect)c.GetBoundingClientRect();
            var mouse = (MouseEvent)e;
            var px = (int)(mouse.ClientX - rect.Left);
            var py = (int)(mouse.ClientY - rect.Top);

            OnClick((MouseEvent)e, px, py);
        }

        public void Update()
        {
            Window.SetTimeout(() =>
            {
                Update();
                OnUpdate();
            }, 15);
        }

        public void InitCanvas(int width, int height, string color = "#fff")
        {
            Canvas.Width = width;
            Canvas.Height = height;
            Context.FillStyle = color;
            Context.FillRect(0, 0, width, width);

            ServerUpdate();
            Update();
        }

        public static void Main()
        {
            var app = new App();
            app.InitCanvas(WIDTH, HEIGHT, color: "#000");

            MenuController menu = new MenuController();
            menu.Init();

            Bridge.Utils.Console.Hide();
        }

        public static void ClearContext()
        {
            Context.FillStyle = "#000";
            Context.FillRect(0, 0, Canvas.Width, Canvas.Height);
        }
    }
}