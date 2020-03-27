/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2020
 * @compiler Bridge.NET 17.10.1
 */
Bridge.assembly("TestGame2D", function ($asm, globals) {
    "use strict";

    Bridge.define("TestGame2D.App", {
        main: function Main () {
            var app = new TestGame2D.App();
            app.InitCanvas(TestGame2D.App.WIDTH, TestGame2D.App.HEIGHT, "#000");

            var menu = new TestGame2D.Controllers.MenuController();
            menu.Init();

            Bridge.Console.hide();
        },
        statics: {
            fields: {
                WIDTH: 0,
                HEIGHT: 0,
                Canvas: null,
                Context: null
            },
            events: {
                OnClick: null,
                OnUpdate: null,
                OnServerUpdate: null
            },
            ctors: {
                init: function () {
                    this.WIDTH = 1600;
                    this.HEIGHT = 900;
                    Bridge.event(this, "OnClick", function () { });
                    Bridge.event(this, "OnUpdate", function () { });
                    Bridge.event(this, "OnServerUpdate", function () { });
                }
            },
            methods: {
                ClearContext: function () {
                    TestGame2D.App.Context.fillStyle = "#000";
                    TestGame2D.App.Context.fillRect(0, 0, TestGame2D.App.Canvas.width, TestGame2D.App.Canvas.height);
                }
            }
        },
        ctors: {
            ctor: function () {
                this.$initialize();
                TestGame2D.App.Canvas = Bridge.cast(document.getElementById("canvas"), HTMLCanvasElement);
                TestGame2D.App.Context = TestGame2D.App.Canvas.getContext("2d");

                TestGame2D.App.Canvas.addEventListener("click", Bridge.fn.bind(this, function (e) {
                    this.GetMousePosition(TestGame2D.App.Canvas, e);
                }));
            }
        },
        methods: {
            ServerUpdate: function () {
                window.setTimeout(Bridge.fn.bind(this, function () {
                    this.Update();
                    TestGame2D.App.OnUpdate();
                }), 100);
            },
            GetMousePosition: function (c, e) {
                var rect = c.getBoundingClientRect();
                var mouse = Bridge.cast(e, MouseEvent);
                var px = Bridge.Int.clip32(mouse.clientX - rect.left);
                var py = Bridge.Int.clip32(mouse.clientY - rect.top);

                TestGame2D.App.OnClick(Bridge.cast(e, MouseEvent), px, py);
            },
            Update: function () {
                window.setTimeout(Bridge.fn.bind(this, function () {
                    this.Update();
                    TestGame2D.App.OnUpdate();
                }), 15);
            },
            InitCanvas: function (width, height, color) {
                if (color === void 0) { color = "#fff"; }
                TestGame2D.App.Canvas.width = width;
                TestGame2D.App.Canvas.height = height;
                TestGame2D.App.Context.fillStyle = color;
                TestGame2D.App.Context.fillRect(0, 0, width, width);

                this.ServerUpdate();
                this.Update();
            }
        }
    });

    Bridge.define("TestGame2D.GameObject", {
        statics: {
            methods: {
                Instantiate$1: function (T, x, y, width, height, resource) {
                    var g = Bridge.createInstance(T);
                    TestGame2D.GameObjectsManager.AddObject$1(T, g);
                    g.SetResource(resource);
                    g.SetPosition(x, y);
                    g.SetSize(width, height);
                    g.SetPivot(0.5, 1);

                    g.Init();
                    return g;
                },
                Instantiate: function (T, id, x, y, width, height, resource) {
                    var g = Bridge.createInstance(T);
                    TestGame2D.GameObjectsManager.AddObject$2(T, id, g);
                    g.SetResource(resource);
                    g.SetPosition(x, y);
                    g.SetSize(width, height);
                    g.SetPivot(0.5, 1);

                    g.Init();
                    return g;
                },
                Destroy: function (T, go) {
                    TestGame2D.GameObjectsManager.RemoveObject(go.ObjectId);
                }
            }
        },
        fields: {
            ObjectId: 0,
            PosX: 0,
            PosY: 0,
            width: 0,
            height: 0,
            imageElement: null,
            offsetX: 0,
            offsetY: 0
        },
        ctors: {
            init: function () {
                this.width = 32;
                this.height = 32;
            }
        },
        methods: {
            Init: function () {

                this.imageElement.addEventListener("click", Bridge.fn.bind(this, function (e) {
                    TestGame2D.PacketSender.ClickTarget(this.ObjectId);
                }));
            },
            Update: function () {

            },
            SetPivot: function (v1, v2) {
                this.offsetX = this.width * v1;
                this.offsetY = this.height * v2;
            },
            SetResource: function (resource) {
                this.imageElement = new Image();
                this.imageElement.src = resource;
            },
            SetSize: function (width, height) {
                this.width = width;
                this.height = height;
            },
            SetPosition: function (x, y) {
                this.PosX = x;
                this.PosY = y;
            },
            Draw: function (ctx) {
                ctx.drawImage(this.imageElement, this.PosX - this.offsetX, this.PosY - this.offsetY, this.width, this.height);
            },
            Draw$1: function (ctx, offsetX, offsetY) {
                ctx.drawImage(this.imageElement, (this.PosX - this.offsetX) - offsetX, (this.PosY - this.offsetY) - offsetY, this.width, this.height);
            }
        }
    });

    Bridge.define("TestGame2D.Click", {
        statics: {
            methods: {
                Clicked: function (go, x, y) {
                    if (go.PosX > x && go.PosY > y && x < ((go.PosX + go.width) | 0) && y < ((go.PosY + go.height) | 0)) {
                        return true;
                    }

                    return false;
                }
            }
        }
    });

    Bridge.define("TestGame2D.Controllers.MenuController", {
        fields: {
            go: null
        },
        methods: {
            Init: function () {
                this.EnterGame();
                return;

            },
            App_OnClick: function (e, arg1, arg2) {
                if (TestGame2D.Click.Clicked(this.go, arg1, arg2)) {
                    this.EnterGame();
                }
            },
            App_OnUpdate: function () {
                this.go.Draw(TestGame2D.App.Context);
            },
            EnterGame: function () {
                TestGame2D.App.removeOnUpdate(Bridge.fn.cacheBind(this, this.App_OnUpdate));
                TestGame2D.App.removeOnClick(Bridge.fn.cacheBind(this, this.App_OnClick));

                var gameController = new TestGame2D.GameController();
                gameController.Init();
            }
        }
    });

    Bridge.define("TestGame2D.GameController", {
        statics: {
            fields: {
                Instance: null
            }
        },
        fields: {
            camera: null,
            map: null,
            player: null,
            playerController: null
        },
        methods: {
            Init: function () {
                TestGame2D.GameController.Instance = this;
                var websocket = new TestGame2D.Networking.WebSocketController();
                websocket.Initialize();

                var m = new TestGame2D.MapsManager();
                this.playerController = new TestGame2D.PlayerController();

                this.SetMap(0);

                TestGame2D.GameObject.Instantiate(TestGame2D.Portal, -9996, 980, 620, 64, 64, "https://freesvg.org/img/teleport.png");

                TestGame2D.App.addOnUpdate(Bridge.fn.cacheBind(this, this.Update));
                TestGame2D.App.addOnClick(Bridge.fn.cacheBind(this, this.App_OnClick));
            },
            SetMap: function (mapId) {
                var map = { };
                if (TestGame2D.MapsManager.GetMap(mapId, map)) {
                    if (this.map != null) {
                        TestGame2D.GameObject.Destroy(TestGame2D.Map, this.map);
                    }

                    this.map = TestGame2D.GameObject.Instantiate(TestGame2D.Map, -9999, ((Bridge.Int.div(map.v.sizeX, 2)) | 0), map.v.sizeY, map.v.sizeX, map.v.sizeY, map.v.resource);
                }
            },
            App_OnClick: function (arg1, arg2, arg3) {
                this.SetPlayerDestination(arg2, arg3);
            },
            SetPlayer: function (c) {
                this.player = c;
                this.camera = TestGame2D.GameObject.Instantiate(TestGame2D.Camera, -9997, 250, 250, 32, 32, "");
                this.camera.SetTarget(c);
            },
            Update: function () {
                var $t;
                TestGame2D.App.ClearContext();

                $t = Bridge.getEnumerator(TestGame2D.GameObjectsManager.GetObjects());
                try {
                    while ($t.moveNext()) {
                        var item = $t.Current;
                        item.value.Update();
                        if (this.camera != null) {
                            item.value.Draw$1(TestGame2D.App.Context, ((this.camera.PosX - this.camera.camOffsetX) | 0), ((this.camera.PosY - this.camera.camOffsetY) | 0));
                        } else {
                            item.value.Draw$1(TestGame2D.App.Context, item.value.PosX, item.value.PosY);
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
            },
            SetPlayerDestination: function (px, py) {
                var destX = (((this.player.PosX + px) | 0) - this.camera.camOffsetX) | 0;
                var destY = (((this.player.PosY + py) | 0) - this.camera.camOffsetY) | 0;

                if (destX < ((this.map.width - this.player.width) | 0) && destY < ((this.map.height - this.player.height) | 0) && destX > ((0 + this.player.width) | 0) && destY > ((0 + this.player.height) | 0)) {
                    TestGame2D.PacketSender.Move(destX, destY);
                }
            }
        }
    });

    Bridge.define("TestGame2D.GameController.MovePacket", {
        $kind: "nested class",
        fields: {
            msgId: 0,
            x: 0,
            y: 0
        }
    });

    Bridge.define("TestGame2D.GameObjectsManager", {
        statics: {
            fields: {
                objects: null,
                lastId: 0
            },
            ctors: {
                init: function () {
                    this.objects = new (System.Collections.Generic.Dictionary$2(System.Int32,TestGame2D.GameObject)).ctor();
                    this.lastId = 1;
                }
            },
            methods: {
                GetNewId: function () {
                    var $t;
                    return Bridge.identity(TestGame2D.GameObjectsManager.lastId, (($t = (TestGame2D.GameObjectsManager.lastId + 1) | 0, TestGame2D.GameObjectsManager.lastId = $t, $t)));
                },
                GetObjects: function () {
                    return TestGame2D.GameObjectsManager.objects;
                },
                AddObject: function (id, go) {
                    if (!TestGame2D.GameObjectsManager.objects.containsKey(id)) {
                        TestGame2D.GameObjectsManager.objects.add(id, go);
                    }
                },
                AddObject$1: function (T, g) {
                    var id = TestGame2D.GameObjectsManager.GetNewId();
                    g.ObjectId = id;
                    TestGame2D.GameObjectsManager.objects.add(id, g);
                },
                AddObject$2: function (T, id, g) {
                    g.ObjectId = id;
                    TestGame2D.GameObjectsManager.objects.add(id, g);
                },
                RemoveObject: function (id) {
                    TestGame2D.GameObjectsManager.objects.remove(id);
                },
                GetObject: function (T, id, go) {
                    var go2 = { };
                    if (TestGame2D.GameObjectsManager.objects.tryGetValue(id, go2)) {
                        if (Bridge.is(go2.v, T)) {
                            go.v = Bridge.as(go2.v, T);
                            return true;
                        }
                    }

                    go.v = null;
                    return false;
                }
            }
        }
    });

    Bridge.define("TestGame2D.Managers.Time", {
        statics: {
            props: {
                time: {
                    get: function () {
                        return Date.now() / 1000.0;
                    }
                }
            }
        }
    });

    Bridge.define("TestGame2D.MapData", {
        fields: {
            sizeX: 0,
            sizeY: 0,
            resource: null
        }
    });

    Bridge.define("TestGame2D.MapsManager", {
        statics: {
            fields: {
                maps: null
            },
            ctors: {
                init: function () {
                    this.maps = new (System.Collections.Generic.Dictionary$2(System.Int32,TestGame2D.MapData)).ctor();
                }
            },
            methods: {
                GetMap: function (id, map) {
                    return TestGame2D.MapsManager.maps.tryGetValue(id, map);
                }
            }
        },
        ctors: {
            ctor: function () {
                var $t;
                this.$initialize();
                TestGame2D.MapsManager.maps.add(0, ($t = new TestGame2D.MapData(), $t.resource = "https://i.stack.imgur.com/NaUX7.png", $t.sizeX = 1000, $t.sizeY = 1000, $t));

                TestGame2D.MapsManager.maps.add(1, ($t = new TestGame2D.MapData(), $t.resource = "https://dat5n5oxdq-flywheel.netdna-ssl.com/wp-content/uploads/2016/02/Map1-e1456506413351.png", $t.sizeX = 1000, $t.sizeY = 1000, $t));
            }
        }
    });

    Bridge.define("TestGame2D.Networking.WebSocketController", {
        statics: {
            fields: {
                DEFAULT_SERVICE_URI: null,
                Instance: null
            },
            ctors: {
                init: function () {
                    this.DEFAULT_SERVICE_URI = "ws://echo.websocket.org/";
                }
            },
            methods: {
                ReadMessage: function (id, obj) {
                    switch (id) {
                        case 0: 
                            var objectId = Bridge.cast(obj.id, System.Int32);
                            var baseId = Bridge.cast(obj.bId, System.Int32);
                            var x = Bridge.cast(obj.x, System.Int32);
                            var y = Bridge.cast(obj.y, System.Int32);
                            try {
                                var mobModel = getMobModel(baseId);
                                TestGame2D.GameObject.Instantiate(TestGame2D.Character, objectId, x, y, 32, 32, mobModel.resource);
                            } catch (ex) {
                                ex = System.Exception.create(ex);
                                System.Console.WriteLine("Err:" + objectId);
                                System.Console.WriteLine(Bridge.toString(ex));
                            }
                            break;
                        case 1: 
                            {
                                var go = { };
                                if (TestGame2D.GameObjectsManager.GetObject(TestGame2D.GameObject, Bridge.cast(obj.id, System.Int32), go)) {
                                    TestGame2D.GameObject.Destroy(TestGame2D.GameObject, go.v);
                                }
                            }
                            break;
                        case 2: 
                            {
                                var c = { };
                                if (TestGame2D.GameObjectsManager.GetObject(TestGame2D.Character, Bridge.cast(obj.id, System.Int32), c)) {
                                    c.v.SetDestination(Bridge.cast(obj.x, System.Int32), Bridge.cast(obj.y, System.Int32));
                                }
                            }
                            break;
                        case 3: 
                            {
                                var pl = { };
                                if (TestGame2D.GameObjectsManager.GetObject(TestGame2D.Character, Bridge.cast(obj.id, System.Int32), pl)) {
                                    TestGame2D.GameController.Instance.SetPlayer(pl.v);
                                }
                            }
                            break;
                        case 4: 
                            TestGame2D.GameController.Instance.SetMap(Bridge.cast(obj.mapId, System.Int32));
                            TestGame2D.GameController.Instance.player.SetPosition(Bridge.cast(obj.x, System.Int32), Bridge.cast(obj.y, System.Int32));
                            break;
                    }
                }
            }
        },
        fields: {
            Socket: null
        },
        methods: {
            Send: function (data) {
                if (this.Socket != null) {
                    this.Socket.send(data);
                }
            },
            View_OnDisconnecting: function (sender, e) {
                if (this.Socket != null) {
                    this.Socket.close(1000, "User would like to close");
                }
            },
            View_OnShuttingUp: function (sender, e) {
                if (this.Socket != null) {
                    this.Socket.close(1001, "Shutting up");

                    window.alert("AWAY");
                }
            },
            OnSocketOpen: function (e) { },
            OnSocketClose: function (e) { },
            OnSocketMessage: function (e) {

                var obj = JSON.parse(Bridge.toString(e.data));
                var msgId = Bridge.cast(obj.msgId, System.Int32);
                TestGame2D.Networking.WebSocketController.ReadMessage(msgId, obj);
            },
            OnSocketError: function (e) {
                var error = e.message;
            },
            Initialize: function () {
                TestGame2D.Networking.WebSocketController.Instance = this;

                try {
                    var config = getConfig();
                    this.Socket = new WebSocket(config.gameIp);

                    this.Socket.onopen = Bridge.fn.combine(this.Socket.onopen, Bridge.fn.cacheBind(this, this.OnSocketOpen));
                    this.Socket.onclose = Bridge.fn.combine(this.Socket.onclose, Bridge.fn.cacheBind(this, this.OnSocketClose));
                    this.Socket.onmessage = Bridge.fn.combine(this.Socket.onmessage, Bridge.fn.cacheBind(this, this.OnSocketMessage));
                    this.Socket.onerror = Bridge.fn.combine(this.Socket.onerror, Bridge.fn.cacheBind(this, this.OnSocketError));
                } catch (ex) {
                    ex = System.Exception.create(ex);
                    System.Console.WriteLine(ex);
                }
            }
        }
    });

    Bridge.define("TestGame2D.PacketSender", {
        statics: {
            methods: {
                Move: function (destX, destY) {
                    var x = { };
                    x.msgId = 0;
                    x.x = destX;
                    x.y = destY;

                    TestGame2D.Networking.WebSocketController.Instance.Send(JSON.stringify(x));
                },
                ClickTarget: function (targetId) {
                    var x = { };
                    x.msgId = 1;
                    x.id = targetId;

                    TestGame2D.Networking.WebSocketController.Instance.Send(JSON.stringify(x));
                }
            }
        }
    });

    Bridge.define("TestGame2D.PlayerController", {
        methods: {
            SetPlayer: function (player) {

            }
        }
    });

    Bridge.define("TestGame2D.Camera", {
        inherits: [TestGame2D.GameObject],
        fields: {
            target: null,
            camOffsetX: 0,
            camOffsetY: 0
        },
        methods: {
            SetTarget: function (target) {
                this.target = target;
            },
            Init: function () {
                this.camOffsetX = (800);
                this.camOffsetY = (450);
            },
            Update: function () {
                this.PosX = this.target.PosX;
                this.PosY = this.target.PosY;
            },
            Draw$1: function (ctx, offsetX, offsetY) { }
        }
    });

    Bridge.define("TestGame2D.Character", {
        inherits: [TestGame2D.GameObject],
        fields: {
            DestinationX: 0,
            DestinationY: 0,
            Speed: 0,
            rotated: false,
            isLocallyObserved: false
        },
        ctors: {
            init: function () {
                this.Speed = 1;
                this.rotated = false;
                this.isLocallyObserved = false;
            }
        },
        methods: {
            SetDestination: function (x, y) {
                this.DestinationX = x;
                this.DestinationY = y;
            },
            SetPosition: function (x, y) {
                TestGame2D.GameObject.prototype.SetPosition.call(this, x, y);
                this.DestinationX = x;
                this.DestinationY = y;
            },
            Init: function () {
                TestGame2D.GameObject.prototype.Init.call(this);
                this.DestinationX = this.PosX;
                this.DestinationY = this.PosY;
            },
            Update: function () {
                TestGame2D.GameObject.prototype.Update.call(this);
                this.UpdateDestination();
            },
            UpdateDestination: function () {
                var speed = this.Speed;
                if (this.PosX !== this.DestinationX) {
                    if (Math.abs(((this.DestinationX - this.PosX) | 0)) < speed) {
                        this.PosX = (this.PosX + (this.DestinationX > this.PosX ? 1 : -1)) | 0;
                    } else {
                        this.PosX = (this.PosX + (this.DestinationX > this.PosX ? this.Speed : ((-this.Speed) | 0))) | 0;
                    }

                    if (this.rotated && this.DestinationX < this.PosX) {
                        this.rotated = false;
                        this.imageElement.width = 1;
                    } else if (!this.rotated && this.DestinationX > this.PosX) {
                        this.rotated = true;
                        this.imageElement.width = Bridge.Int.mul(Math.abs(this.imageElement.width), -1);
                    }
                }

                if (this.PosY !== this.DestinationY) {
                    if (Math.abs(((this.DestinationY - this.PosY) | 0)) < speed) {
                        this.PosY = (this.PosY + (this.DestinationY > this.PosY ? 1 : -1)) | 0;
                    } else {
                        this.PosY = (this.PosY + (this.DestinationY > this.PosY ? this.Speed : ((-this.Speed) | 0))) | 0;
                    }
                }
            },
            Draw$1: function (ctx, offsetX, offsetY) {
                if (!this.isLocallyObserved) {
                    TestGame2D.GameObject.prototype.Draw$1.call(this, ctx, offsetX, offsetY);
                } else {
                    ctx.drawImage(this.imageElement, (800) - this.offsetX, (450) - this.offsetY, this.width, this.height);
                }
            }
        }
    });

    Bridge.define("TestGame2D.Map", {
        inherits: [TestGame2D.GameObject]
    });

    Bridge.define("TestGame2D.Portal", {
        inherits: [TestGame2D.GameObject]
    });

    Bridge.define("TestGame2D.Player", {
        inherits: [TestGame2D.Character]
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJUZXN0R2FtZTJELmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHAuY3MiLCJNb2RlbHMvR2FtZU9iamVjdC5jcyIsIkNsaWNrLmNzIiwiQ29udHJvbGxlcnMvTWVudUNvbnRyb2xsZXIuY3MiLCJDb250cm9sbGVycy9HYW1lQ29udHJvbGxlci5jcyIsIk1hbmFnZXJzL0dhbWVPYmplY3RzTWFuYWdlci5jcyIsIk1hbmFnZXJzL1RpbWUuY3MiLCJNYW5hZ2Vycy9NYXBzTWFuYWdlci5jcyIsIkNvbnRyb2xsZXJzL1dlYlNvY2tldENvbnRyb2xsZXIuY3MiLCJDb250cm9sbGVycy9QYWNrZXRTZW5kZXIuY3MiLCJDb250cm9sbGVycy9QbGF5ZXJDb250cm9sbGVyLmNzIiwiTW9kZWxzL0NhbWVyYS5jcyIsIk1vZGVscy9DaGFyYWN0ZXIuY3MiXSwKICAibmFtZXMiOiBbIiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7WUFtRVlBLFVBQVVBLElBQUlBO1lBQ2RBLGVBQWVBLHNCQUFPQTs7WUFFdEJBLFdBQXNCQSxJQUFJQTtZQUMxQkE7O1lBRUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7a0RBMUR1REE7bURBQ3JCQTt5REFDTUE7Ozs7O29CQTZEeENBO29CQUNBQSxzQ0FBdUJBLDZCQUFjQTs7Ozs7OztnQkExRHJDQSx3QkFBYUEsWUFBbUJBO2dCQUNoQ0EseUJBQWNBLEFBQTBCQTs7Z0JBRXhDQSxnREFBcUNBLEFBQWdCQTtvQkFBS0Esc0JBQWlCQSx1QkFBWUE7Ozs7OztnQkFJdkZBLGtCQUFrQkEsQUFBU0E7b0JBRXZCQTtvQkFDQUE7Ozt3Q0FJcUJBLEdBQXFCQTtnQkFFOUNBLFdBQVdBLEFBQVlBO2dCQUN2QkEsWUFBWUEsWUFBWUE7Z0JBQ3hCQSxTQUFTQSxrQkFBS0EsQUFBQ0EsZ0JBQWdCQTtnQkFDL0JBLFNBQVNBLGtCQUFLQSxBQUFDQSxnQkFBZ0JBOztnQkFFL0JBLHVCQUFRQSxZQUFZQSxnQkFBR0EsSUFBSUE7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Ozs7OztpQ0NLQUE7Z0JBRWxCQSxjQUFjQTs7O2dCQUtkQSxrQkFBYUEsQ0FBQ0E7Z0JBQ2RBLGtCQUFhQSxDQUFDQTs7O2dCQUtkQSxZQUFPQTtnQkFDUEEsWUFBT0E7OzhCQUdlQSxLQUE4QkEsU0FBYUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQ0NaMUNBLEdBQU9BO2dCQUU5QkEsb0JBQWVBO2dCQUNmQSxvQkFBZUE7O21DQUdjQSxHQUFPQTtnQkFFcENBLHVEQUFpQkEsR0FBR0E7Z0JBQ3BCQSxvQkFBZUE7Z0JBQ2ZBLG9CQUFlQTs7O2dCQUtmQTtnQkFDQUEsb0JBQWVBO2dCQUNmQSxvQkFBZUE7OztnQkFLZkE7Z0JBQ0FBOzs7Z0JBS0FBLFlBQVlBO2dCQUNaQSxJQUFJQSxjQUFRQTtvQkFFUkEsSUFBSUEsU0FBU0Esc0JBQWVBLG1CQUFRQTt3QkFFaENBLHlCQUFRQSxDQUFDQSxvQkFBZUEsZ0JBQVdBOzt3QkFJbkNBLHlCQUFRQSxDQUFDQSxvQkFBZUEsWUFBT0EsYUFBUUEsR0FBQ0E7OztvQkFHNUNBLElBQUdBLGdCQUFXQSxvQkFBZUE7d0JBRXpCQTt3QkFDQUE7MkJBRUNBLElBQUdBLENBQUNBLGdCQUFXQSxvQkFBZUE7d0JBRS9CQTt3QkFDQUEsMEJBQXFCQSx3QkFBU0EsMEJBQXNCQTs7OztnQkFJNURBLElBQUlBLGNBQVFBO29CQUVSQSxJQUFJQSxTQUFTQSxzQkFBZUEsbUJBQVFBO3dCQUVoQ0EseUJBQVFBLHFCQUFlQSxnQkFBV0E7O3dCQUlsQ0EseUJBQVFBLHFCQUFlQSxZQUFPQSxhQUFRQSxHQUFDQTs7Ozs4QkFLekJBLEtBQThCQSxTQUFhQTtnQkFFakVBLElBQUdBLENBQUNBO29CQUVBQSxrREFBVUEsS0FBS0EsU0FBU0E7O29CQUl4QkEsY0FBY0EsbUJBQWNBLENBQUNBLE9BQWlCQSxjQUFjQSxDQUFDQSxPQUFrQkEsY0FBY0EsWUFBT0EiLAogICJzb3VyY2VzQ29udGVudCI6IFsidXNpbmcgQnJpZGdlO1xyXG51c2luZyBCcmlkZ2UuSHRtbDU7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgVGVzdEdhbWUyRC5Db250cm9sbGVycztcclxuXHJcbm5hbWVzcGFjZSBUZXN0R2FtZTJEXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBBcHBcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIEhUTUxDYW52YXNFbGVtZW50IENhbnZhcyB7IGdldDsgcHJpdmF0ZSBzZXQ7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBDb250ZXh0IHsgZ2V0OyBwcml2YXRlIHNldDsgfSAgICBcclxuXHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBXSURUSCA9IDE2MDA7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBIRUlHSFQgPSA5MDA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZXZlbnQgQWN0aW9uPE1vdXNlRXZlbnQsIGludCwgaW50PiBPbkNsaWNrID0gZGVsZWdhdGUgeyB9O1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZXZlbnQgQWN0aW9uIE9uVXBkYXRlID0gZGVsZWdhdGUgeyB9O1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZXZlbnQgQWN0aW9uIE9uU2VydmVyVXBkYXRlID0gZGVsZWdhdGUgeyB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgQXBwKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEFwcC5DYW52YXMgPSAoSFRNTENhbnZhc0VsZW1lbnQpRG9jdW1lbnQuR2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgICAgIEFwcC5Db250ZXh0ID0gKENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRClDYW52YXMuR2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgICAgICAgICAgQXBwLkNhbnZhcy5BZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKEFjdGlvbjxFdmVudD4pKGUgPT4gR2V0TW91c2VQb3NpdGlvbihBcHAuQ2FudmFzLCBlKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgdm9pZCBTZXJ2ZXJVcGRhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgV2luZG93LlNldFRpbWVvdXQoKEFjdGlvbikoKCkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgVXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBPblVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9KSwgMTAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIEdldE1vdXNlUG9zaXRpb24oSFRNTENhbnZhc0VsZW1lbnQgYywgRXZlbnQgZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciByZWN0ID0gKENsaWVudFJlY3QpYy5HZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICAgICAgdmFyIG1vdXNlID0gKE1vdXNlRXZlbnQpZTtcclxuICAgICAgICAgICAgdmFyIHB4ID0gKGludCkobW91c2UuQ2xpZW50WCAtIHJlY3QuTGVmdCk7XHJcbiAgICAgICAgICAgIHZhciBweSA9IChpbnQpKG1vdXNlLkNsaWVudFkgLSByZWN0LlRvcCk7XHJcblxyXG4gICAgICAgICAgICBPbkNsaWNrKChNb3VzZUV2ZW50KWUsIHB4LCBweSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBVcGRhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgV2luZG93LlNldFRpbWVvdXQoKEFjdGlvbikoKCkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgVXBkYXRlKCk7XHJcbiAgICAgICAgICAgICAgICBPblVwZGF0ZSgpO1xyXG4gICAgICAgICAgICB9KSwgMTUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgSW5pdENhbnZhcyhpbnQgd2lkdGgsIGludCBoZWlnaHQsIHN0cmluZyBjb2xvciA9IFwiI2ZmZlwiKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2FudmFzLldpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIENhbnZhcy5IZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIENvbnRleHQuRmlsbFN0eWxlID0gY29sb3I7XHJcbiAgICAgICAgICAgIENvbnRleHQuRmlsbFJlY3QoMCwgMCwgd2lkdGgsIHdpZHRoKTtcclxuXHJcbiAgICAgICAgICAgIFNlcnZlclVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBVcGRhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBhcHAgPSBuZXcgQXBwKCk7XHJcbiAgICAgICAgICAgIGFwcC5Jbml0Q2FudmFzKFdJRFRILCBIRUlHSFQsIGNvbG9yOiBcIiMwMDBcIik7XHJcblxyXG4gICAgICAgICAgICBNZW51Q29udHJvbGxlciBtZW51ID0gbmV3IE1lbnVDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIG1lbnUuSW5pdCgpO1xyXG5cclxuICAgICAgICAgICAgQnJpZGdlLlV0aWxzLkNvbnNvbGUuSGlkZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIENsZWFyQ29udGV4dCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDb250ZXh0LkZpbGxTdHlsZSA9IFwiIzAwMFwiO1xyXG4gICAgICAgICAgICBDb250ZXh0LkZpbGxSZWN0KDAsIDAsIENhbnZhcy5XaWR0aCwgQ2FudmFzLkhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG51c2luZyBCcmlkZ2UuSHRtbDU7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgR2FtZU9iamVjdFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgT2JqZWN0SWQgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFBvc1g7XHJcbiAgICAgICAgcHVibGljIGludCBQb3NZO1xyXG5cclxuICAgICAgICBwdWJsaWMgaW50IHdpZHRoID0gMzI7XHJcbiAgICAgICAgcHVibGljIGludCBoZWlnaHQgPSAzMjtcclxuXHJcbiAgICAgICAgcHVibGljIEhUTUxJbWFnZUVsZW1lbnQgaW1hZ2VFbGVtZW50O1xyXG4gICAgICAgIHByb3RlY3RlZCBmbG9hdCBvZmZzZXRYO1xyXG4gICAgICAgIHByb3RlY3RlZCBmbG9hdCBvZmZzZXRZO1xyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIEluaXQoKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgICAgIGltYWdlRWxlbWVudC5BZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKEFjdGlvbjxFdmVudD4pKGUgPT4gUGFja2V0U2VuZGVyLkNsaWNrVGFyZ2V0KE9iamVjdElkKSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBVcGRhdGUoKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFQgSW5zdGFudGlhdGU8VD4oaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQsIHN0cmluZyByZXNvdXJjZSkgd2hlcmUgVCA6IEdhbWVPYmplY3QsIG5ldygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBUIGcgPSBuZXcgVCgpO1xyXG4gICAgICAgICAgICBHYW1lT2JqZWN0c01hbmFnZXIuQWRkT2JqZWN0PFQ+KGcpO1xyXG4gICAgICAgICAgICBnLlNldFJlc291cmNlKHJlc291cmNlKTtcclxuICAgICAgICAgICAgZy5TZXRQb3NpdGlvbih4LCB5KTtcclxuICAgICAgICAgICAgZy5TZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICBnLlNldFBpdm90KDAuNWYsIDEpO1xyXG5cclxuICAgICAgICAgICAgZy5Jbml0KCk7XHJcbiAgICAgICAgICAgIHJldHVybiBnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBUIEluc3RhbnRpYXRlPFQ+KGludCBpZCwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQsIHN0cmluZyByZXNvdXJjZSkgd2hlcmUgVCA6IEdhbWVPYmplY3QsIG5ldygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBUIGcgPSBuZXcgVCgpO1xyXG4gICAgICAgICAgICBHYW1lT2JqZWN0c01hbmFnZXIuQWRkT2JqZWN0PFQ+KGlkLCBnKTtcclxuICAgICAgICAgICAgZy5TZXRSZXNvdXJjZShyZXNvdXJjZSk7XHJcbiAgICAgICAgICAgIGcuU2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICAgICAgICAgIGcuU2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgZy5TZXRQaXZvdCgwLjVmLCAxKTtcclxuXHJcbiAgICAgICAgICAgIGcuSW5pdCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBTZXRQaXZvdChmbG9hdCB2MSwgZmxvYXQgdjIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBvZmZzZXRYID0gd2lkdGggKiB2MTtcclxuICAgICAgICAgICAgb2Zmc2V0WSA9IGhlaWdodCAqIHYyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIERlc3Ryb3k8VD4oVCBnbykgd2hlcmUgVCA6IEdhbWVPYmplY3RcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEdhbWVPYmplY3RzTWFuYWdlci5SZW1vdmVPYmplY3QoZ28uT2JqZWN0SWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFNldFJlc291cmNlKHN0cmluZyByZXNvdXJjZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGltYWdlRWxlbWVudCA9IG5ldyBIVE1MSW1hZ2VFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIGltYWdlRWxlbWVudC5TcmMgPSByZXNvdXJjZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBTZXRTaXplKGludCB3aWR0aCwgaW50IGhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIFNldFBvc2l0aW9uKGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuUG9zWCA9IHg7XHJcbiAgICAgICAgICAgIHRoaXMuUG9zWSA9IHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIERyYXcoQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIGN0eClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGN0eC5EcmF3SW1hZ2UoaW1hZ2VFbGVtZW50LCBQb3NYIC0gb2Zmc2V0WCwgUG9zWSAtIG9mZnNldFksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBEcmF3KENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBjdHgsIGludCBvZmZzZXRYLCBpbnQgb2Zmc2V0WSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGN0eC5EcmF3SW1hZ2UoaW1hZ2VFbGVtZW50LCAoUG9zWCAtIHRoaXMub2Zmc2V0WCkgLSBvZmZzZXRYLCAoUG9zWSAtIHRoaXMub2Zmc2V0WSkgLSBvZmZzZXRZLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFRlc3RHYW1lMkRcclxue1xyXG4gICAgcHVibGljIGNsYXNzIENsaWNrXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBib29sIENsaWNrZWQoR2FtZU9iamVjdCBnbywgaW50IHgsIGludCB5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYoZ28uUG9zWCA+IHggJiYgZ28uUG9zWSA+IHkgJiYgeCA8IGdvLlBvc1ggKyBnby53aWR0aCAmJiB5IDwgZ28uUG9zWSArIGdvLmhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRC5Db250cm9sbGVyc1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgTWVudUNvbnRyb2xsZXJcclxuICAgIHtcclxuICAgICAgICBHYW1lT2JqZWN0IGdvO1xyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBJbml0KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEVudGVyR2FtZSgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGdvID0gR2FtZU9iamVjdC5JbnN0YW50aWF0ZTxHYW1lT2JqZWN0PigtOTk5LCAyMDAsIDIwMCwgMjAwLCAyMDAsIFwiaW1nL3BsYXllcjEucG5nXCIpO1xyXG4gICAgICAgICAgICBnby5pbWFnZUVsZW1lbnQuQWRkRXZlbnRMaXN0ZW5lcihCcmlkZ2UuSHRtbDUuRXZlbnRUeXBlLkNsaWNrLCAoQWN0aW9uPEV2ZW50PikoKGUpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFwiWFhYWFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBFbnRlckdhbWUoKTtcclxuICAgICAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICAgICAgQXBwLk9uVXBkYXRlICs9IEFwcF9PblVwZGF0ZTtcclxuICAgICAgICAgICAgQXBwLk9uQ2xpY2sgKz0gQXBwX09uQ2xpY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQXBwX09uQ2xpY2soTW91c2VFdmVudCBlLCBpbnQgYXJnMSwgaW50IGFyZzIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZihDbGljay5DbGlja2VkKGdvLCBhcmcxLCBhcmcyKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgRW50ZXJHYW1lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBBcHBfT25VcGRhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ28uRHJhdyhBcHAuQ29udGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBFbnRlckdhbWUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQXBwLk9uVXBkYXRlIC09IEFwcF9PblVwZGF0ZTtcclxuICAgICAgICAgICAgQXBwLk9uQ2xpY2sgLT0gQXBwX09uQ2xpY2s7XHJcblxyXG4gICAgICAgICAgICBHYW1lQ29udHJvbGxlciBnYW1lQ29udHJvbGxlciA9IG5ldyBHYW1lQ29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICBnYW1lQ29udHJvbGxlci5Jbml0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIEJyaWRnZS5IdG1sNTtcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG51c2luZyBUZXN0R2FtZTJELk5ldHdvcmtpbmc7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgR2FtZUNvbnRyb2xsZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIEdhbWVDb250cm9sbGVyIEluc3RhbmNlO1xyXG4gICAgICAgIHB1YmxpYyBDYW1lcmEgY2FtZXJhO1xyXG4gICAgICAgIHB1YmxpYyBNYXAgbWFwO1xyXG4gICAgICAgIHB1YmxpYyBDaGFyYWN0ZXIgcGxheWVyO1xyXG5cclxuICAgICAgICAvL1RPRE86IE1pZ3JhdGUgbG9naWMgb2YgcGxheWVyIGlucHV0IHRvIGNvbnRyb2xsZXJcclxuICAgICAgICBwdWJsaWMgUGxheWVyQ29udHJvbGxlciBwbGF5ZXJDb250cm9sbGVyO1xyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBJbml0KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEluc3RhbmNlID0gdGhpcztcclxuICAgICAgICAgICAgV2ViU29ja2V0Q29udHJvbGxlciB3ZWJzb2NrZXQgPSBuZXcgV2ViU29ja2V0Q29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICB3ZWJzb2NrZXQuSW5pdGlhbGl6ZSgpO1xyXG5cclxuICAgICAgICAgICAgTWFwc01hbmFnZXIgbSA9IG5ldyBNYXBzTWFuYWdlcigpO1xyXG4gICAgICAgICAgICBwbGF5ZXJDb250cm9sbGVyID0gbmV3IFBsYXllckNvbnRyb2xsZXIoKTtcclxuXHJcbiAgICAgICAgICAgIFNldE1hcCgwKTtcclxuXHJcbiAgICAgICAgICAgIEdhbWVPYmplY3QuSW5zdGFudGlhdGU8UG9ydGFsPigtOTk5NiwgOTgwLCA2MjAsIDY0LCA2NCwgXCJodHRwczovL2ZyZWVzdmcub3JnL2ltZy90ZWxlcG9ydC5wbmdcIik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBBcHAuT25VcGRhdGUgKz0gVXBkYXRlO1xyXG4gICAgICAgICAgICBBcHAuT25DbGljayArPSBBcHBfT25DbGljaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNldE1hcChpbnQgbWFwSWQpXHJcbiAgICAgICAge1xyXG5NYXBEYXRhIG1hcDtcbiAgICAgICAgICAgIGlmKE1hcHNNYW5hZ2VyLkdldE1hcChtYXBJZCwgb3V0IG1hcCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubWFwICE9IG51bGwpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgR2FtZU9iamVjdC5EZXN0cm95PE1hcD4odGhpcy5tYXApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubWFwID0gR2FtZU9iamVjdC5JbnN0YW50aWF0ZTxNYXA+KC05OTk5LCBtYXAuc2l6ZVggLyAyLCBtYXAuc2l6ZVksIG1hcC5zaXplWCwgbWFwLnNpemVZLCBtYXAucmVzb3VyY2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQXBwX09uQ2xpY2soTW91c2VFdmVudCBhcmcxLCBpbnQgYXJnMiwgaW50IGFyZzMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBTZXRQbGF5ZXJEZXN0aW5hdGlvbihhcmcyLCBhcmczKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNldFBsYXllcihDaGFyYWN0ZXIgYylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsYXllciA9IGM7XHJcbiAgICAgICAgICAgIGNhbWVyYSA9IEdhbWVPYmplY3QuSW5zdGFudGlhdGU8Q2FtZXJhPigtOTk5NywgMjUwLCAyNTAsIDMyLCAzMiwgXCJcIik7XHJcbiAgICAgICAgICAgIGNhbWVyYS5TZXRUYXJnZXQoYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBVcGRhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQXBwLkNsZWFyQ29udGV4dCgpO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAodmFyIGl0ZW0gaW4gR2FtZU9iamVjdHNNYW5hZ2VyLkdldE9iamVjdHMoKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5WYWx1ZS5VcGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYW1lcmEgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLlZhbHVlLkRyYXcoQXBwLkNvbnRleHQsIGNhbWVyYS5Qb3NYIC0gY2FtZXJhLmNhbU9mZnNldFgsIGNhbWVyYS5Qb3NZIC0gY2FtZXJhLmNhbU9mZnNldFkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uVmFsdWUuRHJhdyhBcHAuQ29udGV4dCwgaXRlbS5WYWx1ZS5Qb3NYLCBpdGVtLlZhbHVlLlBvc1kpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgY2xhc3MgTW92ZVBhY2tldFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcHVibGljIGludCBtc2dJZDtcclxuICAgICAgICAgICAgcHVibGljIGludCB4O1xyXG4gICAgICAgICAgICBwdWJsaWMgaW50IHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBTZXRQbGF5ZXJEZXN0aW5hdGlvbihpbnQgcHgsIGludCBweSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBkZXN0WCA9IHBsYXllci5Qb3NYICsgcHggLSBjYW1lcmEuY2FtT2Zmc2V0WDtcclxuICAgICAgICAgICAgdmFyIGRlc3RZID0gcGxheWVyLlBvc1kgKyBweSAtIGNhbWVyYS5jYW1PZmZzZXRZO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3RYIDwgbWFwLndpZHRoIC0gcGxheWVyLndpZHRoICYmIGRlc3RZIDwgbWFwLmhlaWdodCAtIHBsYXllci5oZWlnaHQgJiYgXHJcbiAgICAgICAgICAgICAgICBkZXN0WCA+IDAgKyBwbGF5ZXIud2lkdGggJiYgZGVzdFkgPiAwICsgcGxheWVyLmhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgUGFja2V0U2VuZGVyLk1vdmUoZGVzdFgsIGRlc3RZKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgR2FtZU9iamVjdHNNYW5hZ2VyXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgRGljdGlvbmFyeTxpbnQsIEdhbWVPYmplY3Q+IG9iamVjdHMgPSBuZXcgRGljdGlvbmFyeTxpbnQsIEdhbWVPYmplY3Q+KCk7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGxhc3RJZCA9IDE7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IEdldE5ld0lkKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBsYXN0SWQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRGljdGlvbmFyeTxpbnQsIEdhbWVPYmplY3Q+IEdldE9iamVjdHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgQWRkT2JqZWN0KGludCBpZCwgR2FtZU9iamVjdCBnbylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghb2JqZWN0cy5Db250YWluc0tleShpZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9iamVjdHMuQWRkKGlkLCBnbyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBSZW1vdmVPYmplY3QoaW50IGlkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgb2JqZWN0cy5SZW1vdmUoaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIEFkZE9iamVjdDxUPihUIGcpIHdoZXJlIFQgOiBHYW1lT2JqZWN0XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgaWQgPSBHZXROZXdJZCgpO1xyXG4gICAgICAgICAgICBnLk9iamVjdElkID0gaWQ7XHJcbiAgICAgICAgICAgIG9iamVjdHMuQWRkKGlkLCBnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIEFkZE9iamVjdDxUPihpbnQgaWQsIFQgZykgd2hlcmUgVCA6IEdhbWVPYmplY3RcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGcuT2JqZWN0SWQgPSBpZDtcclxuICAgICAgICAgICAgb2JqZWN0cy5BZGQoaWQsIGcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBib29sIEdldE9iamVjdDxUPihpbnQgaWQsIG91dCBUIGdvKSB3aGVyZSBUIDogR2FtZU9iamVjdFxyXG4gICAgICAgIHtcclxuR2FtZU9iamVjdCBnbzI7XG4gICAgICAgICAgICBpZihvYmplY3RzLlRyeUdldFZhbHVlKGlkLCBvdXQgZ28yKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYoZ28yIGlzIFQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ28gPSBnbzIgYXMgVDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZ28gPSBudWxsO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBUZXN0R2FtZTJELk1hbmFnZXJzXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBUaW1lXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBmbG9hdCB0aW1lXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXRcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChmbG9hdCkoKGZsb2F0KUVudmlyb25tZW50LlRpY2tDb3VudCAvIDEwMDBmKTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgTWFwc01hbmFnZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIERpY3Rpb25hcnk8aW50LCBNYXBEYXRhPiBtYXBzID0gbmV3IERpY3Rpb25hcnk8aW50LCBNYXBEYXRhPigpO1xyXG5cclxuICAgICAgICBwdWJsaWMgTWFwc01hbmFnZXIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbWFwcy5BZGQoMCwgbmV3IE1hcERhdGEoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZSA9IFwiaHR0cHM6Ly9pLnN0YWNrLmltZ3VyLmNvbS9OYVVYNy5wbmdcIixcclxuICAgICAgICAgICAgICAgIHNpemVYID0gMTAwMCxcclxuICAgICAgICAgICAgICAgIHNpemVZID0gMTAwMFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG1hcHMuQWRkKDEsIG5ldyBNYXBEYXRhKClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2UgPSBcImh0dHBzOi8vZGF0NW41b3hkcS1mbHl3aGVlbC5uZXRkbmEtc3NsLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAxNi8wMi9NYXAxLWUxNDU2NTA2NDEzMzUxLnBuZ1wiLFxyXG4gICAgICAgICAgICAgICAgc2l6ZVggPSAxMDAwLFxyXG4gICAgICAgICAgICAgICAgc2l6ZVkgPSAxMDAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBib29sIEdldE1hcChpbnQgaWQsIG91dCBNYXBEYXRhIG1hcClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXBzLlRyeUdldFZhbHVlKGlkLCBvdXQgbWFwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsYXNzIE1hcERhdGFcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IHNpemVYO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgc2l6ZVk7XHJcbiAgICAgICAgcHVibGljIHN0cmluZyByZXNvdXJjZTtcclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBCcmlkZ2U7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxuXHJcbi8vLyA8c3VtbWFyeT5cclxuLy8vIGh0dHA6Ly93d3cud2Vic29ja2V0Lm9yZy9lY2hvLmh0bWwgZGVtbyB3cml0dGVuIGluIEMjIHdpdGggQnJpZGdlLk5FVFxyXG4vLy8gPC9zdW1tYXJ5PlxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRC5OZXR3b3JraW5nXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBXZWJTb2NrZXRDb250cm9sbGVyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBXZWJTb2NrZXRDb250cm9sbGVyIEluc3RhbmNlIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG4gICAgICAgIHByaXZhdGUgY29uc3Qgc3RyaW5nIERFRkFVTFRfU0VSVklDRV9VUkkgPSBcIndzOi8vZWNoby53ZWJzb2NrZXQub3JnL1wiO1xyXG5cclxuICAgICAgICBwdWJsaWMgV2ViU29ja2V0IFNvY2tldCB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgICNyZWdpb24gVmlldyBldmVudHNcclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2VuZChzdHJpbmcgZGF0YSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChTb2NrZXQgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgU29ja2V0LlNlbmQoZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBWaWV3X09uRGlzY29ubmVjdGluZyhvYmplY3Qgc2VuZGVyLCBFdmVudEFyZ3MgZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChTb2NrZXQgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgU29ja2V0LkNsb3NlKENsb3NlRXZlbnQuU3RhdHVzQ29kZS5DTE9TRV9OT1JNQUwsIFwiVXNlciB3b3VsZCBsaWtlIHRvIGNsb3NlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgVmlld19PblNodXR0aW5nVXAob2JqZWN0IHNlbmRlciwgRXZlbnRBcmdzIGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoU29ja2V0ICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNvY2tldC5DbG9zZShDbG9zZUV2ZW50LlN0YXR1c0NvZGUuQ0xPU0VfR09JTkdfQVdBWSwgXCJTaHV0dGluZyB1cFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBXaW5kb3cuQWxlcnQoXCJBV0FZXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAjZW5kcmVnaW9uIFZpZXcgZXZlbnRzXHJcblxyXG4gICAgICAgICNyZWdpb24gU29ja2V0IGV2ZW50c1xyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgT25Tb2NrZXRPcGVuKEV2ZW50IGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvL0NvbnNvbGUuV3JpdGVMaW5lKFwiQ09OTkVDVEVEOiBcIiArIFNvY2tldC5VcmwpO1xyXG4gICAgICAgIH0gICBcclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0Q2xvc2UoQ2xvc2VFdmVudCBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9Db25zb2xlLldyaXRlTGluZShcIkRJU0NPTk5FQ1RFRDoge1JlYXNvbjogXCIgKyBlLlJlYXNvbiArIFwiLCBDb2RlOiBcIiArIGUuQ29kZSArIFwiLCBXYXNDbGVhbjogXCIgKyBlLldhc0NsZWFuICsgXCJ9XCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0TWVzc2FnZShNZXNzYWdlRXZlbnQgZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vQ29uc29sZS5Xcml0ZUxpbmUoZS5EYXRhICE9IG51bGwgPyBlLkRhdGEuVG9TdHJpbmcoKSA6IFwibm8gcmVwb25zZSBkYXRhXCIpO1xyXG5cclxuICAgICAgICAgICAgZHluYW1pYyBvYmogPSBKU09OLlBhcnNlKGUuRGF0YS5Ub1N0cmluZygpKTtcclxuICAgICAgICAgICAgaW50IG1zZ0lkID0gKGludClvYmoubXNnSWQ7XHJcbiAgICAgICAgICAgIFJlYWRNZXNzYWdlKG1zZ0lkLCBvYmopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBSZWFkTWVzc2FnZShpbnQgaWQsIGR5bmFtaWMgb2JqKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3dpdGNoKGlkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IG9iamVjdElkID0gKGludClvYmouaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGJhc2VJZCA9IChpbnQpb2JqLmJJZDtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgeCA9IChpbnQpb2JqLng7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IHkgPSAoaW50KW9iai55O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb2JNb2RlbCA9IFNjcmlwdC5DYWxsPGR5bmFtaWM+KFwiZ2V0TW9iTW9kZWxcIiwgYmFzZUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgR2FtZU9iamVjdC5JbnN0YW50aWF0ZTxDaGFyYWN0ZXI+KG9iamVjdElkLCB4LCB5LCAzMiwgMzIsIG1vYk1vZGVsLnJlc291cmNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2goRXhjZXB0aW9uIGV4KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUoXCJFcnI6XCIgKyBvYmplY3RJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKGV4LlRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxue1xyXG4gICAgR2FtZU9iamVjdCBnbztcclxuICAgIGlmIChHYW1lT2JqZWN0c01hbmFnZXIuR2V0T2JqZWN0PEdhbWVPYmplY3Q+KChpbnQpb2JqLmlkLCBvdXQgZ28pKVxyXG4gICAge1xyXG4gICAgICAgIEdhbWVPYmplY3QuRGVzdHJveTxHYW1lT2JqZWN0Pihnbyk7XHJcbiAgICB9XHJcbn0gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG57XHJcbiAgICBDaGFyYWN0ZXIgYztcclxuICAgIGlmIChHYW1lT2JqZWN0c01hbmFnZXIuR2V0T2JqZWN0PENoYXJhY3Rlcj4oKGludClvYmouaWQsIG91dCBjKSlcclxuICAgIHtcclxuICAgICAgICBjLlNldERlc3RpbmF0aW9uKChpbnQpb2JqLngsIChpbnQpb2JqLnkpO1xyXG4gICAgfVxyXG59ICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxue1xyXG4gICAgQ2hhcmFjdGVyIHBsO1xyXG4gICAgaWYgKEdhbWVPYmplY3RzTWFuYWdlci5HZXRPYmplY3Q8Q2hhcmFjdGVyPigoaW50KW9iai5pZCwgb3V0IHBsKSlcclxuICAgIHtcclxuICAgICAgICBHYW1lQ29udHJvbGxlci5JbnN0YW5jZS5TZXRQbGF5ZXIocGwpO1xyXG4gICAgfVxyXG59ICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBHYW1lQ29udHJvbGxlci5JbnN0YW5jZS5TZXRNYXAoKGludClvYmoubWFwSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIEdhbWVDb250cm9sbGVyLkluc3RhbmNlLnBsYXllci5TZXRQb3NpdGlvbigoaW50KW9iai54LCAoaW50KW9iai55KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0RXJyb3IoRXZlbnQgZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBlcnJvciA9IGVbXCJtZXNzYWdlXCJdO1xyXG4gICAgICAgICAgICAvL1ZpZXcuTG9nRXJyb3IoZXJyb3IgIT0gbnVsbCA/IGVycm9yLlRvU3RyaW5nKCkgOiBcIlwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICNlbmRyZWdpb24gU29ja2V0IGV2ZW50c1xyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBJbml0aWFsaXplKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEluc3RhbmNlID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvL0NvbnNvbGUuV3JpdGVMaW5lKFwiQ29ubmVjdGluZy4uLlwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBjb25maWcgPSBTY3JpcHQuQ2FsbDxkeW5hbWljPihcImdldENvbmZpZ1wiKTtcclxuICAgICAgICAgICAgICAgIFNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLmdhbWVJcCk7XHJcblxyXG4gICAgICAgICAgICAgICAgU29ja2V0Lk9uT3BlbiArPSBPblNvY2tldE9wZW47XHJcbiAgICAgICAgICAgICAgICBTb2NrZXQuT25DbG9zZSArPSBPblNvY2tldENsb3NlO1xyXG4gICAgICAgICAgICAgICAgU29ja2V0Lk9uTWVzc2FnZSArPSBPblNvY2tldE1lc3NhZ2U7XHJcbiAgICAgICAgICAgICAgICBTb2NrZXQuT25FcnJvciArPSBPblNvY2tldEVycm9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChFeGNlcHRpb24gZXgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKGV4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBCcmlkZ2UuSHRtbDU7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxudXNpbmcgVGVzdEdhbWUyRC5OZXR3b3JraW5nO1xyXG5cclxubmFtZXNwYWNlIFRlc3RHYW1lMkRcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBhY2tldFNlbmRlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNb3ZlKGludCBkZXN0WCwgaW50IGRlc3RZKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHluYW1pYyB4ID0gbmV3IG9iamVjdCgpO1xyXG4gICAgICAgICAgICB4Lm1zZ0lkID0gMDtcclxuICAgICAgICAgICAgeC54ID0gZGVzdFg7XHJcbiAgICAgICAgICAgIHgueSA9IGRlc3RZO1xyXG5cclxuICAgICAgICAgICAgV2ViU29ja2V0Q29udHJvbGxlci5JbnN0YW5jZS5TZW5kKEpTT04uU3RyaW5naWZ5KHgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBDbGlja1RhcmdldChpbnQgdGFyZ2V0SWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkeW5hbWljIHggPSBuZXcgb2JqZWN0KCk7XHJcbiAgICAgICAgICAgIHgubXNnSWQgPSAxO1xyXG4gICAgICAgICAgICB4LmlkID0gdGFyZ2V0SWQ7XHJcblxyXG4gICAgICAgICAgICBXZWJTb2NrZXRDb250cm9sbGVyLkluc3RhbmNlLlNlbmQoSlNPTi5TdHJpbmdpZnkoeCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgUGxheWVyQ29udHJvbGxlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNldFBsYXllcihQbGF5ZXIgcGxheWVyKVxyXG4gICAgICAgIHtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIEJyaWRnZS5IdG1sNTtcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFRlc3RHYW1lMkRcclxue1xyXG4gICAgcHVibGljIGNsYXNzIENhbWVyYSA6IEdhbWVPYmplY3RcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgQ2hhcmFjdGVyIHRhcmdldDtcclxuICAgICAgICBwdWJsaWMgaW50IGNhbU9mZnNldFg7XHJcbiAgICAgICAgcHVibGljIGludCBjYW1PZmZzZXRZO1xyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBTZXRUYXJnZXQoQ2hhcmFjdGVyIHRhcmdldClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgSW5pdCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjYW1PZmZzZXRYID0gKEFwcC5XSURUSCAvIDIpO1xyXG4gICAgICAgICAgICBjYW1PZmZzZXRZID0gKEFwcC5IRUlHSFQgLyAyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFVwZGF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBQb3NYID0gdGFyZ2V0LlBvc1g7XHJcbiAgICAgICAgICAgIFBvc1kgPSB0YXJnZXQuUG9zWTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIERyYXcoQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIGN0eCwgaW50IG9mZnNldFgsIGludCBvZmZzZXRZKVxyXG4gICAgICAgIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcbnVzaW5nIFRlc3RHYW1lMkQuTWFuYWdlcnM7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQ2hhcmFjdGVyIDogR2FtZU9iamVjdFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgRGVzdGluYXRpb25YO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgRGVzdGluYXRpb25ZO1xyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFNwZWVkID0gMTtcclxuXHJcbiAgICAgICAgcHVibGljIGJvb2wgcm90YXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHB1YmxpYyBib29sIGlzTG9jYWxseU9ic2VydmVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNldERlc3RpbmF0aW9uKGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIERlc3RpbmF0aW9uWCA9IHg7XHJcbiAgICAgICAgICAgIERlc3RpbmF0aW9uWSA9IHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBTZXRQb3NpdGlvbihpbnQgeCwgaW50IHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBiYXNlLlNldFBvc2l0aW9uKHgsIHkpO1xyXG4gICAgICAgICAgICBEZXN0aW5hdGlvblggPSB4O1xyXG4gICAgICAgICAgICBEZXN0aW5hdGlvblkgPSB5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgSW5pdCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBiYXNlLkluaXQoKTtcclxuICAgICAgICAgICAgRGVzdGluYXRpb25YID0gUG9zWDtcclxuICAgICAgICAgICAgRGVzdGluYXRpb25ZID0gUG9zWTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFVwZGF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBiYXNlLlVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBVcGRhdGVEZXN0aW5hdGlvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFVwZGF0ZURlc3RpbmF0aW9uKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBzcGVlZCA9IHRoaXMuU3BlZWQ7XHJcbiAgICAgICAgICAgIGlmIChQb3NYICE9IERlc3RpbmF0aW9uWClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguQWJzKERlc3RpbmF0aW9uWCAtIFBvc1gpIDwgc3BlZWQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgUG9zWCArPSAoRGVzdGluYXRpb25YID4gUG9zWCA/IDEgOiAtMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgUG9zWCArPSAoRGVzdGluYXRpb25YID4gUG9zWCA/IFNwZWVkIDogLVNwZWVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihyb3RhdGVkICYmIERlc3RpbmF0aW9uWCA8IFBvc1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudC5XaWR0aCA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKCFyb3RhdGVkICYmIERlc3RpbmF0aW9uWCA+IFBvc1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VFbGVtZW50LldpZHRoID0gTWF0aC5BYnMoaW1hZ2VFbGVtZW50LldpZHRoKSAqIC0xO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoUG9zWSAhPSBEZXN0aW5hdGlvblkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChNYXRoLkFicyhEZXN0aW5hdGlvblkgLSBQb3NZKSA8IHNwZWVkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFBvc1kgKz0gRGVzdGluYXRpb25ZID4gUG9zWSA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBQb3NZICs9IERlc3RpbmF0aW9uWSA+IFBvc1kgPyBTcGVlZCA6IC1TcGVlZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgRHJhdyhDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgY3R4LCBpbnQgb2Zmc2V0WCwgaW50IG9mZnNldFkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZighaXNMb2NhbGx5T2JzZXJ2ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJhc2UuRHJhdyhjdHgsIG9mZnNldFgsIG9mZnNldFkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY3R4LkRyYXdJbWFnZShpbWFnZUVsZW1lbnQsIChBcHAuV0lEVEggLyAyKSAtIHRoaXMub2Zmc2V0WCwgKEFwcC5IRUlHSFQgLyAyKSAtIHRoaXMub2Zmc2V0WSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl0KfQo=
