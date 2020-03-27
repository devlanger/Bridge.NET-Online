using Bridge.Html5;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TestGame2D.Networking;

namespace TestGame2D
{
    public class PacketSender
    {
        public static void Move(int destX, int destY)
        {
            dynamic x = new object();
            x.msgId = 0;
            x.x = destX;
            x.y = destY;

            WebSocketController.Instance.Send(JSON.Stringify(x));
        }

        public static void ClickTarget(int targetId)
        {
            dynamic x = new object();
            x.msgId = 1;
            x.id = targetId;

            WebSocketController.Instance.Send(JSON.Stringify(x));
        }
    }
}
