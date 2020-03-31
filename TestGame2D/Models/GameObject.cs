using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bridge;
using Bridge.Html5;

namespace TestGame2D
{
    public class GameObject
    {
        public int ObjectId { get; set; }

        public int PosX;
        public int PosY;

        public int width = 64;
        public int height = 64;

        public HTMLImageElement imageElement;
        public float offsetX;
        public float offsetY;
        public int order = 1;

        public virtual void Init()
        {
            imageElement.AddEventListener("click", e => PacketSender.ClickTarget(ObjectId));
        }

        public virtual void Update()
        {

        }

        public static T Instantiate<T>(int x, int y, int width, int height, string resource) where T : GameObject, new()
        {
            T g = new T();
            GameObjectsManager.AddObject(g);
            g.SetResource(resource);
            g.SetPosition(x, y);
            g.SetSize(width, height);
            g.SetPivot(0.5f, 1);

            g.Init();
            return g;
        }


        public static T Instantiate<T>(int id, int x, int y, int width, int height, string resource) where T : GameObject, new()
        {
            T g = new T();
            GameObjectsManager.AddObject(id, g);
            g.SetResource(resource);
            g.SetPosition(x, y);
            g.SetSize(width, height);
            g.SetPivot(0.5f, 1);

            g.Init();
            return g;
        }

        private void SetPivot(float v1, float v2)
        {
            offsetX = width * v1;
            offsetY = height * v2;
        }

        public static void Destroy<T>(T go) where T : GameObject
        {
            GameObjectsManager.RemoveObject(go.ObjectId);
        }

        public virtual void Click()
        {
            PacketSender.ClickTarget(ObjectId);
        }

        private void SetResource(string resource)
        {
            imageElement = new HTMLImageElement();
            imageElement.Src = resource;
        }

        private void SetSize(int width, int height)
        {
            this.width = width;
            this.height = height;
        }

        public virtual void SetPosition(int x, int y)
        {
            this.PosX = x;
            this.PosY = y;
        }

        public virtual void Draw(CanvasRenderingContext2D ctx)
        {
            ctx.DrawImage(imageElement, PosX - offsetX, PosY - offsetY, width, height);
        }

        public virtual void Draw(CanvasRenderingContext2D ctx, int offsetX, int offsetY)
        {
            ctx.DrawImage(imageElement, (PosX - this.offsetX) - offsetX, (PosY - this.offsetY) - offsetY, width, height);
        }
    }
}
