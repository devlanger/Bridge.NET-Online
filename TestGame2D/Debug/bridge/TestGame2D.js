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
            offsetY: 0,
            order: 0
        },
        ctors: {
            init: function () {
                this.width = 32;
                this.height = 32;
                this.order = 1;
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
            Click: function () {
                TestGame2D.PacketSender.ClickTarget(this.ObjectId);
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
                    if (x > go.PosX - go.offsetX && x < go.PosX - go.offsetX + go.width && y > go.PosY - go.offsetY && y < go.PosY - go.offsetY + go.height) {
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
                    this.map.order = 0;
                }
            },
            App_OnClick: function (arg1, arg2, arg3) {
                var $t;
                var clickX = (((this.player.PosX + arg2) | 0) - this.camera.camOffsetX) | 0;
                var clickY = (((this.player.PosY + arg3) | 0) - this.camera.camOffsetY) | 0;
                var maxOrder = 0;

                var clicked = null;
                $t = Bridge.getEnumerator(TestGame2D.GameObjectsManager.GetObjects());
                try {
                    while ($t.moveNext()) {
                        var item = $t.Current;
                        if (TestGame2D.Click.Clicked(item.value, clickX, clickY)) {
                            if (item.value.ObjectId === this.player.ObjectId) {
                                continue;
                            }

                            if (clicked == null) {
                                clicked = item.value;
                            }

                            if (maxOrder <= item.value.order) {
                                maxOrder = item.value.order;
                                clicked = item.value;
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }

                if (clicked != null) {
                    clicked.Click();

                    if (clicked.ObjectId === this.map.ObjectId) {
                        this.SetPlayerDestination(arg2, arg3);
                    }
                }
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
                        case 5: 
                            var stat = Bridge.cast(obj.stat, System.Int32);
                            {
                                var t = { };
                                if (TestGame2D.GameObjectsManager.GetObject(TestGame2D.Character, Bridge.cast(obj.id, System.Int32), t)) {
                                    t.v.SetStat(stat, Bridge.cast(obj.val, System.Int32));
                                }
                            }
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

    Bridge.define("TestGame2D.Stat", {
        $kind: "enum",
        statics: {
            fields: {
                NICKNAME: 1,
                HEALTH: 2,
                LVL: 3,
                EXP: 4
            }
        }
    });

    Bridge.define("TestGame2D.Time", {
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
            TargetId: 0,
            DestinationX: 0,
            DestinationY: 0,
            Speed: 0,
            rotated: false,
            isLocallyObserved: false,
            stats: null
        },
        ctors: {
            init: function () {
                this.TargetId = -1;
                this.Speed = 1;
                this.rotated = false;
                this.isLocallyObserved = false;
                this.stats = new (System.Collections.Generic.Dictionary$2(TestGame2D.Stat,System.Int32)).ctor();
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
                var $t;
                TestGame2D.GameObject.prototype.Init.call(this);
                this.DestinationX = this.PosX;
                this.DestinationY = this.PosY;


                $t = Bridge.getEnumerator(System.Enum.getValues(TestGame2D.Stat));
                try {
                    while ($t.moveNext()) {
                        var item = $t.Current;
                        this.stats.add(System.Nullable.getValue(Bridge.cast(Bridge.unbox(item, TestGame2D.Stat), System.Int32)), 0);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$Dispose();
                    }
                }
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
            },
            SetStat: function (stat, val) {
                this.stats.setItem(stat, val);

                if (stat === TestGame2D.Stat.EXP) {
                    setExperience(val);
                }

                if (stat === TestGame2D.Stat.LVL) {
                    setLevel(val);
                }
            }
        }
    });

    Bridge.define("TestGame2D.Map", {
        inherits: [TestGame2D.GameObject],
        methods: {
            Click: function () {

            }
        }
    });

    Bridge.define("TestGame2D.Portal", {
        inherits: [TestGame2D.GameObject]
    });

    Bridge.define("TestGame2D.Player", {
        inherits: [TestGame2D.Character]
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJUZXN0R2FtZTJELmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHAuY3MiLCJNb2RlbHMvR2FtZU9iamVjdC5jcyIsIkNsaWNrLmNzIiwiQ29udHJvbGxlcnMvTWVudUNvbnRyb2xsZXIuY3MiLCJDb250cm9sbGVycy9HYW1lQ29udHJvbGxlci5jcyIsIk1hbmFnZXJzL0dhbWVPYmplY3RzTWFuYWdlci5jcyIsIk1hbmFnZXJzL1RpbWUuY3MiLCJNYW5hZ2Vycy9NYXBzTWFuYWdlci5jcyIsIkNvbnRyb2xsZXJzL1dlYlNvY2tldENvbnRyb2xsZXIuY3MiLCJDb250cm9sbGVycy9QYWNrZXRTZW5kZXIuY3MiLCJDb250cm9sbGVycy9QbGF5ZXJDb250cm9sbGVyLmNzIiwiVGltZS5jcyIsIk1vZGVscy9DYW1lcmEuY3MiLCJNb2RlbHMvQ2hhcmFjdGVyLmNzIl0sCiAgIm5hbWVzIjogWyIiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7O1lBbUVZQSxVQUFVQSxJQUFJQTtZQUNkQSxlQUFlQSxzQkFBT0E7O1lBRXRCQSxXQUFzQkEsSUFBSUE7WUFDMUJBOztZQUVBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tEQTFEdURBO21EQUNyQkE7eURBQ01BOzs7OztvQkE2RHhDQTtvQkFDQUEsc0NBQXVCQSw2QkFBY0E7Ozs7Ozs7Z0JBMURyQ0Esd0JBQWFBLFlBQW1CQTtnQkFDaENBLHlCQUFjQSxBQUEwQkE7O2dCQUV4Q0EsZ0RBQXFDQSxBQUFnQkE7b0JBQUtBLHNCQUFpQkEsdUJBQVlBOzs7Ozs7Z0JBSXZGQSxrQkFBa0JBLEFBQVNBO29CQUV2QkE7b0JBQ0FBOzs7d0NBSXFCQSxHQUFxQkE7Z0JBRTlDQSxXQUFXQSxBQUFZQTtnQkFDdkJBLFlBQVlBLFlBQVlBO2dCQUN4QkEsU0FBU0Esa0JBQUtBLEFBQUNBLGdCQUFnQkE7Z0JBQy9CQSxTQUFTQSxrQkFBS0EsQUFBQ0EsZ0JBQWdCQTs7Z0JBRS9CQSx1QkFBUUEsWUFBWUEsZ0JB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QTtnQkFDQUE7OztnQkFLQUEsWUFBWUE7Z0JBQ1pBLElBQUlBLGNBQVFBO29CQUVSQSxJQUFJQSxTQUFTQSxzQkFBZUEsbUJBQVFBO3dCQUVoQ0EseUJBQVFBLENBQUNBLG9CQUFlQSxnQkFBV0E7O3dCQUluQ0EseUJBQVFBLENBQUNBLG9CQUFlQSxZQUFPQSxhQUFRQSxHQUFDQTs7O29CQUc1Q0EsSUFBR0EsZ0JBQVdBLG9CQUFlQTt3QkFFekJBO3dCQUNBQTsyQkFFQ0EsSUFBR0EsQ0FBQ0EsZ0JBQVdBLG9CQUFlQTt3QkFFL0JBO3dCQUNBQSwwQkFBcUJBLHdCQUFTQSwwQkFBc0JBOzs7O2dCQUk1REEsSUFBSUEsY0FBUUE7b0JBRVJBLElBQUlBLFNBQVNBLHNCQUFlQSxtQkFBUUE7d0JBRWhDQSx5QkFBUUEscUJBQWVBLGdCQUFXQTs7d0JBSWxDQSx5QkFBUUEscUJBQWVBLFlBQU9BLGFBQVFBLEdBQUNBOzs7OzhCQUt6QkEsS0FBOEJBLFNBQWFBO2dCQUVqRUEsSUFBR0EsQ0FBQ0E7b0JBRUFBLGtEQUFVQSxLQUFLQSxTQUFTQTs7b0JBSXhCQSxjQUFjQSxtQkFBY0EsQ0FBQ0EsT0FBaUJBLGNBQWNBLENBQUNBLE9BQWtCQSxjQUFjQSxZQUFPQTs7OytCQUl4RkEsTUFBV0E7Z0JBRTNCQSxtQkFBTUEsTUFBUUE7O2dCQUVkQSxJQUFHQSxTQUFRQTtvQkFFUEEsY0FBNkJBOzs7Z0JBR2pDQSxJQUFJQSxTQUFRQTtvQkFFUkEsU0FBd0JBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIEJyaWRnZTtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFRlc3RHYW1lMkQuQ29udHJvbGxlcnM7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQXBwXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBIVE1MQ2FudmFzRWxlbWVudCBDYW52YXMgeyBnZXQ7IHByaXZhdGUgc2V0OyB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgQ29udGV4dCB7IGdldDsgcHJpdmF0ZSBzZXQ7IH0gICAgXHJcblxyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgV0lEVEggPSAxNjAwO1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgSEVJR0hUID0gOTAwO1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGV2ZW50IEFjdGlvbjxNb3VzZUV2ZW50LCBpbnQsIGludD4gT25DbGljayA9IGRlbGVnYXRlIHsgfTtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGV2ZW50IEFjdGlvbiBPblVwZGF0ZSA9IGRlbGVnYXRlIHsgfTtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGV2ZW50IEFjdGlvbiBPblNlcnZlclVwZGF0ZSA9IGRlbGVnYXRlIHsgfTtcclxuXHJcbiAgICAgICAgcHVibGljIEFwcCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBBcHAuQ2FudmFzID0gKEhUTUxDYW52YXNFbGVtZW50KURvY3VtZW50LkdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpO1xyXG4gICAgICAgICAgICBBcHAuQ29udGV4dCA9IChDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpQ2FudmFzLkdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgICAgIEFwcC5DYW52YXMuQWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChBY3Rpb248RXZlbnQ+KShlID0+IEdldE1vdXNlUG9zaXRpb24oQXBwLkNhbnZhcywgZSkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHZvaWQgU2VydmVyVXBkYXRlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFdpbmRvdy5TZXRUaW1lb3V0KChBY3Rpb24pKCgpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgT25VcGRhdGUoKTtcclxuICAgICAgICAgICAgfSksIDEwMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBHZXRNb3VzZVBvc2l0aW9uKEhUTUxDYW52YXNFbGVtZW50IGMsIEV2ZW50IGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgcmVjdCA9IChDbGllbnRSZWN0KWMuR2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHZhciBtb3VzZSA9IChNb3VzZUV2ZW50KWU7XHJcbiAgICAgICAgICAgIHZhciBweCA9IChpbnQpKG1vdXNlLkNsaWVudFggLSByZWN0LkxlZnQpO1xyXG4gICAgICAgICAgICB2YXIgcHkgPSAoaW50KShtb3VzZS5DbGllbnRZIC0gcmVjdC5Ub3ApO1xyXG5cclxuICAgICAgICAgICAgT25DbGljaygoTW91c2VFdmVudCllLCBweCwgcHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgVXBkYXRlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFdpbmRvdy5TZXRUaW1lb3V0KChBY3Rpb24pKCgpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFVwZGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgT25VcGRhdGUoKTtcclxuICAgICAgICAgICAgfSksIDE1KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIEluaXRDYW52YXMoaW50IHdpZHRoLCBpbnQgaGVpZ2h0LCBzdHJpbmcgY29sb3IgPSBcIiNmZmZcIilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENhbnZhcy5XaWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICBDYW52YXMuSGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICBDb250ZXh0LkZpbGxTdHlsZSA9IGNvbG9yO1xyXG4gICAgICAgICAgICBDb250ZXh0LkZpbGxSZWN0KDAsIDAsIHdpZHRoLCB3aWR0aCk7XHJcblxyXG4gICAgICAgICAgICBTZXJ2ZXJVcGRhdGUoKTtcclxuICAgICAgICAgICAgVXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgTWFpbigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgYXBwID0gbmV3IEFwcCgpO1xyXG4gICAgICAgICAgICBhcHAuSW5pdENhbnZhcyhXSURUSCwgSEVJR0hULCBjb2xvcjogXCIjMDAwXCIpO1xyXG5cclxuICAgICAgICAgICAgTWVudUNvbnRyb2xsZXIgbWVudSA9IG5ldyBNZW51Q29udHJvbGxlcigpO1xyXG4gICAgICAgICAgICBtZW51LkluaXQoKTtcclxuXHJcbiAgICAgICAgICAgIEJyaWRnZS5VdGlscy5Db25zb2xlLkhpZGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBDbGVhckNvbnRleHQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ29udGV4dC5GaWxsU3R5bGUgPSBcIiMwMDBcIjtcclxuICAgICAgICAgICAgQ29udGV4dC5GaWxsUmVjdCgwLCAwLCBDYW52YXMuV2lkdGgsIENhbnZhcy5IZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxudXNpbmcgQnJpZGdlO1xyXG51c2luZyBCcmlkZ2UuSHRtbDU7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgR2FtZU9iamVjdFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgT2JqZWN0SWQgeyBnZXQ7IHNldDsgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFBvc1g7XHJcbiAgICAgICAgcHVibGljIGludCBQb3NZO1xyXG5cclxuICAgICAgICBwdWJsaWMgaW50IHdpZHRoID0gMzI7XHJcbiAgICAgICAgcHVibGljIGludCBoZWlnaHQgPSAzMjtcclxuXHJcbiAgICAgICAgcHVibGljIEhUTUxJbWFnZUVsZW1lbnQgaW1hZ2VFbGVtZW50O1xyXG4gICAgICAgIHB1YmxpYyBmbG9hdCBvZmZzZXRYO1xyXG4gICAgICAgIHB1YmxpYyBmbG9hdCBvZmZzZXRZO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgb3JkZXIgPSAxO1xyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIEluaXQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW1hZ2VFbGVtZW50LkFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoQWN0aW9uPEV2ZW50PikoZSA9PiBQYWNrZXRTZW5kZXIuQ2xpY2tUYXJnZXQoT2JqZWN0SWQpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIFVwZGF0ZSgpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVCBJbnN0YW50aWF0ZTxUPihpbnQgeCwgaW50IHksIGludCB3aWR0aCwgaW50IGhlaWdodCwgc3RyaW5nIHJlc291cmNlKSB3aGVyZSBUIDogR2FtZU9iamVjdCwgbmV3KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFQgZyA9IG5ldyBUKCk7XHJcbiAgICAgICAgICAgIEdhbWVPYmplY3RzTWFuYWdlci5BZGRPYmplY3Q8VD4oZyk7XHJcbiAgICAgICAgICAgIGcuU2V0UmVzb3VyY2UocmVzb3VyY2UpO1xyXG4gICAgICAgICAgICBnLlNldFBvc2l0aW9uKHgsIHkpO1xyXG4gICAgICAgICAgICBnLlNldFNpemUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIGcuU2V0UGl2b3QoMC41ZiwgMSk7XHJcblxyXG4gICAgICAgICAgICBnLkluaXQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGc7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBUIEluc3RhbnRpYXRlPFQ+KGludCBpZCwgaW50IHgsIGludCB5LCBpbnQgd2lkdGgsIGludCBoZWlnaHQsIHN0cmluZyByZXNvdXJjZSkgd2hlcmUgVCA6IEdhbWVPYmplY3QsIG5ldygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBUIGcgPSBuZXcgVCgpO1xyXG4gICAgICAgICAgICBHYW1lT2JqZWN0c01hbmFnZXIuQWRkT2JqZWN0PFQ+KGlkLCBnKTtcclxuICAgICAgICAgICAgZy5TZXRSZXNvdXJjZShyZXNvdXJjZSk7XHJcbiAgICAgICAgICAgIGcuU2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICAgICAgICAgIGcuU2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgZy5TZXRQaXZvdCgwLjVmLCAxKTtcclxuXHJcbiAgICAgICAgICAgIGcuSW5pdCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBTZXRQaXZvdChmbG9hdCB2MSwgZmxvYXQgdjIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBvZmZzZXRYID0gd2lkdGggKiB2MTtcclxuICAgICAgICAgICAgb2Zmc2V0WSA9IGhlaWdodCAqIHYyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIERlc3Ryb3k8VD4oVCBnbykgd2hlcmUgVCA6IEdhbWVPYmplY3RcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEdhbWVPYmplY3RzTWFuYWdlci5SZW1vdmVPYmplY3QoZ28uT2JqZWN0SWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBDbGljaygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBQYWNrZXRTZW5kZXIuQ2xpY2tUYXJnZXQoT2JqZWN0SWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFNldFJlc291cmNlKHN0cmluZyByZXNvdXJjZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGltYWdlRWxlbWVudCA9IG5ldyBIVE1MSW1hZ2VFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIGltYWdlRWxlbWVudC5TcmMgPSByZXNvdXJjZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBTZXRTaXplKGludCB3aWR0aCwgaW50IGhlaWdodClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIFNldFBvc2l0aW9uKGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuUG9zWCA9IHg7XHJcbiAgICAgICAgICAgIHRoaXMuUG9zWSA9IHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIERyYXcoQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIGN0eClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGN0eC5EcmF3SW1hZ2UoaW1hZ2VFbGVtZW50LCBQb3NYIC0gb2Zmc2V0WCwgUG9zWSAtIG9mZnNldFksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBEcmF3KENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCBjdHgsIGludCBvZmZzZXRYLCBpbnQgb2Zmc2V0WSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGN0eC5EcmF3SW1hZ2UoaW1hZ2VFbGVtZW50LCAoUG9zWCAtIHRoaXMub2Zmc2V0WCkgLSBvZmZzZXRYLCAoUG9zWSAtIHRoaXMub2Zmc2V0WSkgLSBvZmZzZXRZLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFRlc3RHYW1lMkRcclxue1xyXG4gICAgcHVibGljIGNsYXNzIENsaWNrXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBib29sIENsaWNrZWQoR2FtZU9iamVjdCBnbywgaW50IHgsIGludCB5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHggPiBnby5Qb3NYIC0gZ28ub2Zmc2V0WCAmJiB4IDwgZ28uUG9zWCAtIGdvLm9mZnNldFggKyBnby53aWR0aCAmJiB5ID4gZ28uUG9zWSAtIGdvLm9mZnNldFkgJiYgeSA8IGdvLlBvc1kgLSBnby5vZmZzZXRZICsgZ28uaGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBCcmlkZ2UuSHRtbDU7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBUZXN0R2FtZTJELkNvbnRyb2xsZXJzXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBNZW51Q29udHJvbGxlclxyXG4gICAge1xyXG4gICAgICAgIEdhbWVPYmplY3QgZ287XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIEluaXQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgRW50ZXJHYW1lKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgZ28gPSBHYW1lT2JqZWN0Lkluc3RhbnRpYXRlPEdhbWVPYmplY3Q+KC05OTksIDIwMCwgMjAwLCAyMDAsIDIwMCwgXCJpbWcvcGxheWVyMS5wbmdcIik7XHJcbiAgICAgICAgICAgIGdvLmltYWdlRWxlbWVudC5BZGRFdmVudExpc3RlbmVyKEJyaWRnZS5IdG1sNS5FdmVudFR5cGUuQ2xpY2ssIChBY3Rpb248RXZlbnQ+KSgoZSkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUoXCJYWFhYXCIpO1xyXG5cclxuICAgICAgICAgICAgICAgIEVudGVyR2FtZSgpO1xyXG4gICAgICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgICAgICBBcHAuT25VcGRhdGUgKz0gQXBwX09uVXBkYXRlO1xyXG4gICAgICAgICAgICBBcHAuT25DbGljayArPSBBcHBfT25DbGljaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBBcHBfT25DbGljayhNb3VzZUV2ZW50IGUsIGludCBhcmcxLCBpbnQgYXJnMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmKENsaWNrLkNsaWNrZWQoZ28sIGFyZzEsIGFyZzIpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBFbnRlckdhbWUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEFwcF9PblVwZGF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnby5EcmF3KEFwcC5Db250ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIEVudGVyR2FtZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBBcHAuT25VcGRhdGUgLT0gQXBwX09uVXBkYXRlO1xyXG4gICAgICAgICAgICBBcHAuT25DbGljayAtPSBBcHBfT25DbGljaztcclxuXHJcbiAgICAgICAgICAgIEdhbWVDb250cm9sbGVyIGdhbWVDb250cm9sbGVyID0gbmV3IEdhbWVDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIGdhbWVDb250cm9sbGVyLkluaXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcbnVzaW5nIFRlc3RHYW1lMkQuTmV0d29ya2luZztcclxuXHJcbm5hbWVzcGFjZSBUZXN0R2FtZTJEXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBHYW1lQ29udHJvbGxlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgR2FtZUNvbnRyb2xsZXIgSW5zdGFuY2U7XHJcbiAgICAgICAgcHVibGljIENhbWVyYSBjYW1lcmE7XHJcbiAgICAgICAgcHVibGljIE1hcCBtYXA7XHJcbiAgICAgICAgcHVibGljIENoYXJhY3RlciBwbGF5ZXI7XHJcblxyXG4gICAgICAgIC8vVE9ETzogTWlncmF0ZSBsb2dpYyBvZiBwbGF5ZXIgaW5wdXQgdG8gY29udHJvbGxlclxyXG4gICAgICAgIHB1YmxpYyBQbGF5ZXJDb250cm9sbGVyIHBsYXllckNvbnRyb2xsZXI7XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIEluaXQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgSW5zdGFuY2UgPSB0aGlzO1xyXG4gICAgICAgICAgICBXZWJTb2NrZXRDb250cm9sbGVyIHdlYnNvY2tldCA9IG5ldyBXZWJTb2NrZXRDb250cm9sbGVyKCk7XHJcbiAgICAgICAgICAgIHdlYnNvY2tldC5Jbml0aWFsaXplKCk7XHJcblxyXG4gICAgICAgICAgICBNYXBzTWFuYWdlciBtID0gbmV3IE1hcHNNYW5hZ2VyKCk7XHJcbiAgICAgICAgICAgIHBsYXllckNvbnRyb2xsZXIgPSBuZXcgUGxheWVyQ29udHJvbGxlcigpO1xyXG5cclxuICAgICAgICAgICAgU2V0TWFwKDApO1xyXG5cclxuICAgICAgICAgICAgR2FtZU9iamVjdC5JbnN0YW50aWF0ZTxQb3J0YWw+KC05OTk2LCA5ODAsIDYyMCwgNjQsIDY0LCBcImh0dHBzOi8vZnJlZXN2Zy5vcmcvaW1nL3RlbGVwb3J0LnBuZ1wiKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIEFwcC5PblVwZGF0ZSArPSBVcGRhdGU7XHJcbiAgICAgICAgICAgIEFwcC5PbkNsaWNrICs9IEFwcF9PbkNsaWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2V0TWFwKGludCBtYXBJZClcclxuICAgICAgICB7XHJcbk1hcERhdGEgbWFwO1xuICAgICAgICAgICAgaWYoTWFwc01hbmFnZXIuR2V0TWFwKG1hcElkLCBvdXQgbWFwKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5tYXAgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBHYW1lT2JqZWN0LkRlc3Ryb3k8TWFwPih0aGlzLm1hcCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXAgPSBHYW1lT2JqZWN0Lkluc3RhbnRpYXRlPE1hcD4oLTk5OTksIG1hcC5zaXplWCAvIDIsIG1hcC5zaXplWSwgbWFwLnNpemVYLCBtYXAuc2l6ZVksIG1hcC5yZXNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5vcmRlciA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBBcHBfT25DbGljayhNb3VzZUV2ZW50IGFyZzEsIGludCBhcmcyLCBpbnQgYXJnMylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBjbGlja1ggPSBwbGF5ZXIuUG9zWCArIGFyZzIgLSBjYW1lcmEuY2FtT2Zmc2V0WDtcclxuICAgICAgICAgICAgdmFyIGNsaWNrWSA9IHBsYXllci5Qb3NZICsgYXJnMyAtIGNhbWVyYS5jYW1PZmZzZXRZO1xyXG4gICAgICAgICAgICBpbnQgbWF4T3JkZXIgPSAwO1xyXG5cclxuICAgICAgICAgICAgR2FtZU9iamVjdCBjbGlja2VkID0gbnVsbDtcclxuICAgICAgICAgICAgZm9yZWFjaCAodmFyIGl0ZW0gaW4gR2FtZU9iamVjdHNNYW5hZ2VyLkdldE9iamVjdHMoKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKENsaWNrLkNsaWNrZWQoaXRlbS5WYWx1ZSwgY2xpY2tYLCBjbGlja1kpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLlZhbHVlLk9iamVjdElkID09IHBsYXllci5PYmplY3RJZClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsaWNrZWQgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrZWQgPSBpdGVtLlZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1heE9yZGVyIDw9IGl0ZW0uVmFsdWUub3JkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhPcmRlciA9IGl0ZW0uVmFsdWUub3JkZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrZWQgPSBpdGVtLlZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoY2xpY2tlZCAhPSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGlja2VkLkNsaWNrKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoY2xpY2tlZC5PYmplY3RJZCA9PSBtYXAuT2JqZWN0SWQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgU2V0UGxheWVyRGVzdGluYXRpb24oYXJnMiwgYXJnMyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNldFBsYXllcihDaGFyYWN0ZXIgYylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBsYXllciA9IGM7XHJcbiAgICAgICAgICAgIGNhbWVyYSA9IEdhbWVPYmplY3QuSW5zdGFudGlhdGU8Q2FtZXJhPigtOTk5NywgMjUwLCAyNTAsIDMyLCAzMiwgXCJcIik7XHJcbiAgICAgICAgICAgIGNhbWVyYS5TZXRUYXJnZXQoYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBVcGRhdGUoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQXBwLkNsZWFyQ29udGV4dCgpO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAodmFyIGl0ZW0gaW4gR2FtZU9iamVjdHNNYW5hZ2VyLkdldE9iamVjdHMoKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5WYWx1ZS5VcGRhdGUoKTtcclxuICAgICAgICAgICAgICAgIGlmIChjYW1lcmEgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLlZhbHVlLkRyYXcoQXBwLkNvbnRleHQsIGNhbWVyYS5Qb3NYIC0gY2FtZXJhLmNhbU9mZnNldFgsIGNhbWVyYS5Qb3NZIC0gY2FtZXJhLmNhbU9mZnNldFkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uVmFsdWUuRHJhdyhBcHAuQ29udGV4dCwgaXRlbS5WYWx1ZS5Qb3NYLCBpdGVtLlZhbHVlLlBvc1kpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgY2xhc3MgTW92ZVBhY2tldFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcHVibGljIGludCBtc2dJZDtcclxuICAgICAgICAgICAgcHVibGljIGludCB4O1xyXG4gICAgICAgICAgICBwdWJsaWMgaW50IHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdm9pZCBTZXRQbGF5ZXJEZXN0aW5hdGlvbihpbnQgcHgsIGludCBweSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBkZXN0WCA9IHBsYXllci5Qb3NYICsgcHggLSBjYW1lcmEuY2FtT2Zmc2V0WDtcclxuICAgICAgICAgICAgdmFyIGRlc3RZID0gcGxheWVyLlBvc1kgKyBweSAtIGNhbWVyYS5jYW1PZmZzZXRZO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRlc3RYIDwgbWFwLndpZHRoIC0gcGxheWVyLndpZHRoICYmIGRlc3RZIDwgbWFwLmhlaWdodCAtIHBsYXllci5oZWlnaHQgJiYgXHJcbiAgICAgICAgICAgICAgICBkZXN0WCA+IDAgKyBwbGF5ZXIud2lkdGggJiYgZGVzdFkgPiAwICsgcGxheWVyLmhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgUGFja2V0U2VuZGVyLk1vdmUoZGVzdFgsIGRlc3RZKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgR2FtZU9iamVjdHNNYW5hZ2VyXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgRGljdGlvbmFyeTxpbnQsIEdhbWVPYmplY3Q+IG9iamVjdHMgPSBuZXcgRGljdGlvbmFyeTxpbnQsIEdhbWVPYmplY3Q+KCk7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGxhc3RJZCA9IDE7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgaW50IEdldE5ld0lkKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBsYXN0SWQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRGljdGlvbmFyeTxpbnQsIEdhbWVPYmplY3Q+IEdldE9iamVjdHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgQWRkT2JqZWN0KGludCBpZCwgR2FtZU9iamVjdCBnbylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghb2JqZWN0cy5Db250YWluc0tleShpZCkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9iamVjdHMuQWRkKGlkLCBnbyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBSZW1vdmVPYmplY3QoaW50IGlkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgb2JqZWN0cy5SZW1vdmUoaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIEFkZE9iamVjdDxUPihUIGcpIHdoZXJlIFQgOiBHYW1lT2JqZWN0XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnQgaWQgPSBHZXROZXdJZCgpO1xyXG4gICAgICAgICAgICBnLk9iamVjdElkID0gaWQ7XHJcbiAgICAgICAgICAgIG9iamVjdHMuQWRkKGlkLCBnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIEFkZE9iamVjdDxUPihpbnQgaWQsIFQgZykgd2hlcmUgVCA6IEdhbWVPYmplY3RcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGcuT2JqZWN0SWQgPSBpZDtcclxuICAgICAgICAgICAgb2JqZWN0cy5BZGQoaWQsIGcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBib29sIEdldE9iamVjdDxUPihpbnQgaWQsIG91dCBUIGdvKSB3aGVyZSBUIDogR2FtZU9iamVjdFxyXG4gICAgICAgIHtcclxuR2FtZU9iamVjdCBnbzI7XG4gICAgICAgICAgICBpZihvYmplY3RzLlRyeUdldFZhbHVlKGlkLCBvdXQgZ28yKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYoZ28yIGlzIFQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZ28gPSBnbzIgYXMgVDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZ28gPSBudWxsO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBUZXN0R2FtZTJELk1hbmFnZXJzXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBUaW1lXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBmbG9hdCB0aW1lXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBnZXRcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChmbG9hdCkoKGZsb2F0KUVudmlyb25tZW50LlRpY2tDb3VudCAvIDEwMDBmKTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgTWFwc01hbmFnZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIERpY3Rpb25hcnk8aW50LCBNYXBEYXRhPiBtYXBzID0gbmV3IERpY3Rpb25hcnk8aW50LCBNYXBEYXRhPigpO1xyXG5cclxuICAgICAgICBwdWJsaWMgTWFwc01hbmFnZXIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbWFwcy5BZGQoMCwgbmV3IE1hcERhdGEoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZSA9IFwiaHR0cHM6Ly9pLnN0YWNrLmltZ3VyLmNvbS9OYVVYNy5wbmdcIixcclxuICAgICAgICAgICAgICAgIHNpemVYID0gMTAwMCxcclxuICAgICAgICAgICAgICAgIHNpemVZID0gMTAwMFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIG1hcHMuQWRkKDEsIG5ldyBNYXBEYXRhKClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmVzb3VyY2UgPSBcImh0dHBzOi8vZGF0NW41b3hkcS1mbHl3aGVlbC5uZXRkbmEtc3NsLmNvbS93cC1jb250ZW50L3VwbG9hZHMvMjAxNi8wMi9NYXAxLWUxNDU2NTA2NDEzMzUxLnBuZ1wiLFxyXG4gICAgICAgICAgICAgICAgc2l6ZVggPSAxMDAwLFxyXG4gICAgICAgICAgICAgICAgc2l6ZVkgPSAxMDAwXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBib29sIEdldE1hcChpbnQgaWQsIG91dCBNYXBEYXRhIG1hcClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJldHVybiBtYXBzLlRyeUdldFZhbHVlKGlkLCBvdXQgbWFwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGNsYXNzIE1hcERhdGFcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IHNpemVYO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgc2l6ZVk7XHJcbiAgICAgICAgcHVibGljIHN0cmluZyByZXNvdXJjZTtcclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBCcmlkZ2U7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxuXHJcbi8vLyA8c3VtbWFyeT5cclxuLy8vIGh0dHA6Ly93d3cud2Vic29ja2V0Lm9yZy9lY2hvLmh0bWwgZGVtbyB3cml0dGVuIGluIEMjIHdpdGggQnJpZGdlLk5FVFxyXG4vLy8gPC9zdW1tYXJ5PlxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRC5OZXR3b3JraW5nXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBXZWJTb2NrZXRDb250cm9sbGVyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBXZWJTb2NrZXRDb250cm9sbGVyIEluc3RhbmNlIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG4gICAgICAgIHByaXZhdGUgY29uc3Qgc3RyaW5nIERFRkFVTFRfU0VSVklDRV9VUkkgPSBcIndzOi8vZWNoby53ZWJzb2NrZXQub3JnL1wiO1xyXG5cclxuICAgICAgICBwdWJsaWMgV2ViU29ja2V0IFNvY2tldCB7IGdldDsgc2V0OyB9XHJcblxyXG4gICAgICAgICNyZWdpb24gVmlldyBldmVudHNcclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgU2VuZChzdHJpbmcgZGF0YSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChTb2NrZXQgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgU29ja2V0LlNlbmQoZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBWaWV3X09uRGlzY29ubmVjdGluZyhvYmplY3Qgc2VuZGVyLCBFdmVudEFyZ3MgZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChTb2NrZXQgIT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgU29ja2V0LkNsb3NlKENsb3NlRXZlbnQuU3RhdHVzQ29kZS5DTE9TRV9OT1JNQUwsIFwiVXNlciB3b3VsZCBsaWtlIHRvIGNsb3NlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgVmlld19PblNodXR0aW5nVXAob2JqZWN0IHNlbmRlciwgRXZlbnRBcmdzIGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoU29ja2V0ICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNvY2tldC5DbG9zZShDbG9zZUV2ZW50LlN0YXR1c0NvZGUuQ0xPU0VfR09JTkdfQVdBWSwgXCJTaHV0dGluZyB1cFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICBXaW5kb3cuQWxlcnQoXCJBV0FZXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAjZW5kcmVnaW9uIFZpZXcgZXZlbnRzXHJcblxyXG4gICAgICAgICNyZWdpb24gU29ja2V0IGV2ZW50c1xyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgT25Tb2NrZXRPcGVuKEV2ZW50IGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvL0NvbnNvbGUuV3JpdGVMaW5lKFwiQ09OTkVDVEVEOiBcIiArIFNvY2tldC5VcmwpO1xyXG4gICAgICAgIH0gICBcclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0Q2xvc2UoQ2xvc2VFdmVudCBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy9Db25zb2xlLldyaXRlTGluZShcIkRJU0NPTk5FQ1RFRDoge1JlYXNvbjogXCIgKyBlLlJlYXNvbiArIFwiLCBDb2RlOiBcIiArIGUuQ29kZSArIFwiLCBXYXNDbGVhbjogXCIgKyBlLldhc0NsZWFuICsgXCJ9XCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIE9uU29ja2V0TWVzc2FnZShNZXNzYWdlRXZlbnQgZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vQ29uc29sZS5Xcml0ZUxpbmUoZS5EYXRhICE9IG51bGwgPyBlLkRhdGEuVG9TdHJpbmcoKSA6IFwibm8gcmVwb25zZSBkYXRhXCIpO1xyXG5cclxuICAgICAgICAgICAgZHluYW1pYyBvYmogPSBKU09OLlBhcnNlKGUuRGF0YS5Ub1N0cmluZygpKTtcclxuICAgICAgICAgICAgaW50IG1zZ0lkID0gKGludClvYmoubXNnSWQ7XHJcbiAgICAgICAgICAgIFJlYWRNZXNzYWdlKG1zZ0lkLCBvYmopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBSZWFkTWVzc2FnZShpbnQgaWQsIGR5bmFtaWMgb2JqKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3dpdGNoKGlkKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IG9iamVjdElkID0gKGludClvYmouaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGJhc2VJZCA9IChpbnQpb2JqLmJJZDtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgeCA9IChpbnQpb2JqLng7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IHkgPSAoaW50KW9iai55O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtb2JNb2RlbCA9IFNjcmlwdC5DYWxsPGR5bmFtaWM+KFwiZ2V0TW9iTW9kZWxcIiwgYmFzZUlkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgR2FtZU9iamVjdC5JbnN0YW50aWF0ZTxDaGFyYWN0ZXI+KG9iamVjdElkLCB4LCB5LCAzMiwgMzIsIG1vYk1vZGVsLnJlc291cmNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2F0Y2goRXhjZXB0aW9uIGV4KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUoXCJFcnI6XCIgKyBvYmplY3RJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKGV4LlRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMTpcclxue1xyXG4gICAgR2FtZU9iamVjdCBnbztcclxuICAgIGlmIChHYW1lT2JqZWN0c01hbmFnZXIuR2V0T2JqZWN0PEdhbWVPYmplY3Q+KChpbnQpb2JqLmlkLCBvdXQgZ28pKVxyXG4gICAge1xyXG4gICAgICAgIEdhbWVPYmplY3QuRGVzdHJveTxHYW1lT2JqZWN0Pihnbyk7XHJcbiAgICB9XHJcbn0gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG57XHJcbiAgICBDaGFyYWN0ZXIgYztcclxuICAgIGlmIChHYW1lT2JqZWN0c01hbmFnZXIuR2V0T2JqZWN0PENoYXJhY3Rlcj4oKGludClvYmouaWQsIG91dCBjKSlcclxuICAgIHtcclxuICAgICAgICBjLlNldERlc3RpbmF0aW9uKChpbnQpb2JqLngsIChpbnQpb2JqLnkpO1xyXG4gICAgfVxyXG59ICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzpcclxue1xyXG4gICAgQ2hhcmFjdGVyIHBsO1xyXG4gICAgaWYgKEdhbWVPYmplY3RzTWFuYWdlci5HZXRPYmplY3Q8Q2hhcmFjdGVyPigoaW50KW9iai5pZCwgb3V0IHBsKSlcclxuICAgIHtcclxuICAgICAgICBHYW1lQ29udHJvbGxlci5JbnN0YW5jZS5TZXRQbGF5ZXIocGwpO1xyXG4gICAgfVxyXG59ICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgICAgICBHYW1lQ29udHJvbGxlci5JbnN0YW5jZS5TZXRNYXAoKGludClvYmoubWFwSWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIEdhbWVDb250cm9sbGVyLkluc3RhbmNlLnBsYXllci5TZXRQb3NpdGlvbigoaW50KW9iai54LCAoaW50KW9iai55KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgICAgICBTdGF0IHN0YXQgPSAoU3RhdCkoaW50KW9iai5zdGF0O1xyXG57XHJcbiAgICBDaGFyYWN0ZXIgdDtcclxuICAgIGlmIChHYW1lT2JqZWN0c01hbmFnZXIuR2V0T2JqZWN0PENoYXJhY3Rlcj4oKGludClvYmouaWQsIG91dCB0KSlcclxuICAgIHtcclxuICAgICAgICB0LlNldFN0YXQoc3RhdCwgKGludClvYmoudmFsKTtcclxuICAgIH1cclxufSAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBPblNvY2tldEVycm9yKEV2ZW50IGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBlW1wibWVzc2FnZVwiXTtcclxuICAgICAgICAgICAgLy9WaWV3LkxvZ0Vycm9yKGVycm9yICE9IG51bGwgPyBlcnJvci5Ub1N0cmluZygpIDogXCJcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAjZW5kcmVnaW9uIFNvY2tldCBldmVudHNcclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgSW5pdGlhbGl6ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBJbnN0YW5jZSA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy9Db25zb2xlLldyaXRlTGluZShcIkNvbm5lY3RpbmcuLi5cIik7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlnID0gU2NyaXB0LkNhbGw8ZHluYW1pYz4oXCJnZXRDb25maWdcIik7XHJcbiAgICAgICAgICAgICAgICBTb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5nYW1lSXApO1xyXG5cclxuICAgICAgICAgICAgICAgIFNvY2tldC5Pbk9wZW4gKz0gT25Tb2NrZXRPcGVuO1xyXG4gICAgICAgICAgICAgICAgU29ja2V0Lk9uQ2xvc2UgKz0gT25Tb2NrZXRDbG9zZTtcclxuICAgICAgICAgICAgICAgIFNvY2tldC5Pbk1lc3NhZ2UgKz0gT25Tb2NrZXRNZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgU29ja2V0Lk9uRXJyb3IgKz0gT25Tb2NrZXRFcnJvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoRXhjZXB0aW9uIGV4KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcbnVzaW5nIFRlc3RHYW1lMkQuTmV0d29ya2luZztcclxuXHJcbm5hbWVzcGFjZSBUZXN0R2FtZTJEXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQYWNrZXRTZW5kZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgTW92ZShpbnQgZGVzdFgsIGludCBkZXN0WSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGR5bmFtaWMgeCA9IG5ldyBvYmplY3QoKTtcclxuICAgICAgICAgICAgeC5tc2dJZCA9IDA7XHJcbiAgICAgICAgICAgIHgueCA9IGRlc3RYO1xyXG4gICAgICAgICAgICB4LnkgPSBkZXN0WTtcclxuXHJcbiAgICAgICAgICAgIFdlYlNvY2tldENvbnRyb2xsZXIuSW5zdGFuY2UuU2VuZChKU09OLlN0cmluZ2lmeSh4KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgQ2xpY2tUYXJnZXQoaW50IHRhcmdldElkKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZHluYW1pYyB4ID0gbmV3IG9iamVjdCgpO1xyXG4gICAgICAgICAgICB4Lm1zZ0lkID0gMTtcclxuICAgICAgICAgICAgeC5pZCA9IHRhcmdldElkO1xyXG5cclxuICAgICAgICAgICAgV2ViU29ja2V0Q29udHJvbGxlci5JbnN0YW5jZS5TZW5kKEpTT04uU3RyaW5naWZ5KHgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFRlc3RHYW1lMkRcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBsYXllckNvbnRyb2xsZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgdm9pZCBTZXRQbGF5ZXIoUGxheWVyIHBsYXllcilcclxuICAgICAgICB7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgVGltZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZmxvYXQgdGltZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZ2V0XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoZmxvYXQpKChmbG9hdClFbnZpcm9ubWVudC5UaWNrQ291bnQgLyAxMDAwZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgVGVzdEdhbWUyRFxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQ2FtZXJhIDogR2FtZU9iamVjdFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBDaGFyYWN0ZXIgdGFyZ2V0O1xyXG4gICAgICAgIHB1YmxpYyBpbnQgY2FtT2Zmc2V0WDtcclxuICAgICAgICBwdWJsaWMgaW50IGNhbU9mZnNldFk7XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNldFRhcmdldChDaGFyYWN0ZXIgdGFyZ2V0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBJbml0KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhbU9mZnNldFggPSAoQXBwLldJRFRIIC8gMik7XHJcbiAgICAgICAgICAgIGNhbU9mZnNldFkgPSAoQXBwLkhFSUdIVCAvIDIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgVXBkYXRlKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFBvc1ggPSB0YXJnZXQuUG9zWDtcclxuICAgICAgICAgICAgUG9zWSA9IHRhcmdldC5Qb3NZO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgRHJhdyhDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgY3R4LCBpbnQgb2Zmc2V0WCwgaW50IG9mZnNldFkpXHJcbiAgICAgICAge1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG51c2luZyBUZXN0R2FtZTJELk1hbmFnZXJzO1xyXG5cclxubmFtZXNwYWNlIFRlc3RHYW1lMkRcclxue1xyXG4gICAgcHVibGljIGNsYXNzIENoYXJhY3RlciA6IEdhbWVPYmplY3RcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IFRhcmdldElkID0gLTE7XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbnQgRGVzdGluYXRpb25YO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgRGVzdGluYXRpb25ZO1xyXG5cclxuICAgICAgICBwdWJsaWMgaW50IFNwZWVkID0gMTtcclxuXHJcbiAgICAgICAgcHVibGljIGJvb2wgcm90YXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHB1YmxpYyBib29sIGlzTG9jYWxseU9ic2VydmVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHB1YmxpYyBEaWN0aW9uYXJ5PFN0YXQsIGludD4gc3RhdHMgPSBuZXcgRGljdGlvbmFyeTxTdGF0LCBpbnQ+KCk7XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNldERlc3RpbmF0aW9uKGludCB4LCBpbnQgeSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIERlc3RpbmF0aW9uWCA9IHg7XHJcbiAgICAgICAgICAgIERlc3RpbmF0aW9uWSA9IHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgdm9pZCBTZXRQb3NpdGlvbihpbnQgeCwgaW50IHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBiYXNlLlNldFBvc2l0aW9uKHgsIHkpO1xyXG4gICAgICAgICAgICBEZXN0aW5hdGlvblggPSB4O1xyXG4gICAgICAgICAgICBEZXN0aW5hdGlvblkgPSB5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgSW5pdCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBiYXNlLkluaXQoKTtcclxuICAgICAgICAgICAgRGVzdGluYXRpb25YID0gUG9zWDtcclxuICAgICAgICAgICAgRGVzdGluYXRpb25ZID0gUG9zWTtcclxuXHJcblxyXG4gICAgICAgICAgICBmb3JlYWNoICh2YXIgaXRlbSBpbiBFbnVtLkdldFZhbHVlcyh0eXBlb2YoU3RhdCkpKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdGF0cy5BZGQoKFN0YXQpaXRlbSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFVwZGF0ZSgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBiYXNlLlVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBVcGRhdGVEZXN0aW5hdGlvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFVwZGF0ZURlc3RpbmF0aW9uKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBzcGVlZCA9IHRoaXMuU3BlZWQ7XHJcbiAgICAgICAgICAgIGlmIChQb3NYICE9IERlc3RpbmF0aW9uWClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguQWJzKERlc3RpbmF0aW9uWCAtIFBvc1gpIDwgc3BlZWQpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgUG9zWCArPSAoRGVzdGluYXRpb25YID4gUG9zWCA/IDEgOiAtMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgUG9zWCArPSAoRGVzdGluYXRpb25YID4gUG9zWCA/IFNwZWVkIDogLVNwZWVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZihyb3RhdGVkICYmIERlc3RpbmF0aW9uWCA8IFBvc1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGltYWdlRWxlbWVudC5XaWR0aCA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmKCFyb3RhdGVkICYmIERlc3RpbmF0aW9uWCA+IFBvc1gpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VFbGVtZW50LldpZHRoID0gTWF0aC5BYnMoaW1hZ2VFbGVtZW50LldpZHRoKSAqIC0xO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoUG9zWSAhPSBEZXN0aW5hdGlvblkpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChNYXRoLkFicyhEZXN0aW5hdGlvblkgLSBQb3NZKSA8IHNwZWVkKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFBvc1kgKz0gRGVzdGluYXRpb25ZID4gUG9zWSA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBQb3NZICs9IERlc3RpbmF0aW9uWSA+IFBvc1kgPyBTcGVlZCA6IC1TcGVlZDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgRHJhdyhDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgY3R4LCBpbnQgb2Zmc2V0WCwgaW50IG9mZnNldFkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZighaXNMb2NhbGx5T2JzZXJ2ZWQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGJhc2UuRHJhdyhjdHgsIG9mZnNldFgsIG9mZnNldFkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY3R4LkRyYXdJbWFnZShpbWFnZUVsZW1lbnQsIChBcHAuV0lEVEggLyAyKSAtIHRoaXMub2Zmc2V0WCwgKEFwcC5IRUlHSFQgLyAyKSAtIHRoaXMub2Zmc2V0WSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2b2lkIFNldFN0YXQoU3RhdCBzdGF0LCBpbnQgdmFsKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RhdHNbc3RhdF0gPSB2YWw7XHJcblxyXG4gICAgICAgICAgICBpZihzdGF0ID09IFN0YXQuRVhQKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBTY3JpcHQuQ2FsbChcInNldEV4cGVyaWVuY2VcIiwgdmFsKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHN0YXQgPT0gU3RhdC5MVkwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFNjcmlwdC5DYWxsKFwic2V0TGV2ZWxcIiwgdmFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXQp9Cg==
