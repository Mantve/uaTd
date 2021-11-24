using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using uaTdServer.Class;
using System.IO;

namespace uaTdServer.Hubs
{
    public class GameHub : Hub
    {
        public GameHub()
        { }

        static GameState previousGameState;
        static GameState gameState = GameState.Get();

        public async Task ClientMessage(string jsonData)
        {
            var data = JsonConvert.DeserializeObject<dynamic>(jsonData);
            string messageType = (string)data.type;

            switch (messageType)
            {
                case "LOAD":
                    string [] mapFiles = Directory.GetFiles("./Maps");
                    string [] mapNames = new string[mapFiles.Length];

                    for (int i = 0; i < mapFiles.Length; i++)
                    {
                        JObject mapData = JObject.Parse(File.ReadAllText(mapFiles[i]));
                        mapNames[i] = (string)mapData["name"];
                    }

                    await Clients.Caller.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(new Message<Message_Load>("LOAD", new Message_Load(){
                        playersCount = gameState.GetPlayers().Count(),
                        loadedMaps = mapNames
                    })));
                    break;

                case "JOIN":
                    string username = (string)data.data.username;
                    int stage = (int)data.data.stage;

                    if (!gameState.GetPlayers().Contains(username))
                        gameState.NewPlayer(new Player(username));

                    gameState.SetStage(stage);

                    // Send caller current game state
                    await Clients.Caller.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState()));

                    // Notify others of a new player
                    await Clients.Others.SendAsync("serverDataMessage", jsonData);
                    break;
                case "GAME_RUN_STOP":
                    gameState.SwitchGameActiveState();
                    if (gameState.GetGameActiveState() && !gameState.GetRoundIsActive())
                    {
                        previousGameState = gameState.DeepCopy();
                        Spawner.Get().SetClients(Clients);

                        Thread workerThread = new Thread(() => Spawner.SpawnEnemies(gameState));
                        workerThread.Start();
                    }
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    break;
                case "TOWER_PURCHASE": //nebekvieciamas?
                    gameState.UpdateMoney((double)data.data.change);
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    break;
                case "TOWER_BUILD":
                    if(gameState.GetMoney() >= (double)data.data.price) {
                        gameState.AddTower((int)data.data.x, (int)data.data.y, (int)data.data.type, (double)data.data.price);
                        await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                        await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(TowerBuildMessage((int)data.data.x, (int)data.data.y, (int)data.data.type)));
                    }
                    break;
                case "TOWER_UPGRADE":
                    if(gameState.GetMoney() >= (double)data.data.price) {
                        gameState.UpgradeTower((int)data.data.x, (int)data.data.y, (double)data.data.price);
                        await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                        await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(TowerUpgradeMessage((int)data.data.x, (int)data.data.y)));
                    }
                    break;
                case "TOWER_DOWNGRADE":
                    gameState.DowngradeTower((int)data.data.x, (int)data.data.y);
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(TowerDowngradeMessage((int)data.data.x, (int)data.data.y)));
                    break;
                case "HEALTH_UPDATE":
                    gameState.UpdateHealth((int)data.data.change);
                    gameState.RemoveBacteria((int)data.data.bacteriaID);
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    if (gameState.GetHealth() == 0)
                        await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(new Message<string>("GAME_OVER", "GAME_OVER")));
                    break;
                case "ENEMY_DEATH":
                    gameState.RemoveBacteria((int)data.data.bacteriaID);
                    break;
                case "RESET_GAME":
                    gameState.Reset();
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("RESET_GAME")));
                    break;
                case "RESET_ROUND":
                    previousGameState.SwitchGameActiveState();
                    gameState = previousGameState;
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("RESET_ROUND")));
                    break;
                case "GAME_OVER":
                    gameState.SetGameIsOver();
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    break;
                case "DEV_MONEY":
                    string moneyAction = (string)data.data.action;
                    double moneyValue = (double)data.data.value;

                    if(moneyAction == "add") {
                        gameState.UpdateMoney(moneyValue);
                    } else if(moneyAction == "sub") {
                        gameState.UpdateMoney(moneyValue * -1);
                    } else if(moneyAction == "set") {
                        gameState.SetMoney(moneyValue);
                    }

                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    break;
                case "DEV_GAME":
                    string gameAction = (string)data.data.action;

                    if(gameAction == "game") {
                        gameState.Reset();
                        await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("RESET_GAME")));
                    } else if(gameAction == "round") {
                        previousGameState.SwitchGameActiveState();
                        gameState = previousGameState;
                        await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("RESET_ROUND")));
                    }
                    
                    break;
                default:
                    await Clients.All.SendAsync("serverDataMessage", jsonData);
                    break;
            }
        }

        private Message<Message_GameState> GetGameState(string messageType = "GAMESTATE_INIT")
        {
            Message_GameState messageGameState = new();
            messageGameState.map = gameState.GetMap();
            messageGameState.money = gameState.GetMoney();
            messageGameState.score = gameState.GetScore();
            messageGameState.health = gameState.GetHealth();
            messageGameState.bacterias = gameState.GetBacterias();
            messageGameState.wave = gameState.GetWave();
            messageGameState.gameActiveState = gameState.GetGameActiveState();
            messageGameState.gameIsOver = gameState.GetGameIsOver();
            messageGameState.roundIsActive = gameState.GetRoundIsActive();
            messageGameState.stage = gameState.GetStage();

            return new Message<Message_GameState>(messageType, messageGameState);
        }

        private Message<Message_Tower_Build> TowerBuildMessage(int x, int y, int type)
        {
            return new Message<Message_Tower_Build>("TOWER_BUILD", new Message_Tower_Build() { x = x, y = y, type = type * 10 });
        }

        private Message<Message_Tower_Upgrade> TowerUpgradeMessage(int x, int y)
        {
            return new Message<Message_Tower_Upgrade>("TOWER_UPGRADE", new Message_Tower_Upgrade() { x = x, y = y });
        }

        private Message<Message_Tower_Downgrade> TowerDowngradeMessage(int x, int y)
        {
            return new Message<Message_Tower_Downgrade>("TOWER_DOWNGRADE", new Message_Tower_Downgrade() { x = x, y = y });
        }
    }
}