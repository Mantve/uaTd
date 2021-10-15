using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using uaTdServer.Class;

namespace uaTdServer.Hubs
{
    public class GameHub : Hub
    {
        public GameHub()
        {

        }

        static GameState gameState = GameState.Get();

        public async Task ClientMessage(string jsonData)
        {
            var data = JsonConvert.DeserializeObject<dynamic>(jsonData);

            string messageType = (string)data.type;

            switch (messageType)
            {
                case "JOIN":
                    string username = (string)data.data.username;
                    if (!gameState.GetPlayers().Contains(username))
                        gameState.NewPlayer(new Player(username));

                    // Send caller current game state
                    await Clients.Caller.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState()));

                    // Notify others of a new player
                    await Clients.Others.SendAsync("serverDataMessage", jsonData);
                    break;
                case "GAME_RUN_STOP":
                    gameState.SwitchGameActiveState();
                    if (gameState.GetGameActiveState())
                    {
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
                    gameState.AddTower((int)data.data.x, (int)data.data.y, (int)data.data.type, (double)data.data.price);
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(TowerBuildMessage((int)data.data.x, (int)data.data.y, (int)data.data.type)));
                    break;
                case "TOWER_UPGRADE":
                    gameState.UpgradeTower((int)data.data.x, (int)data.data.y, (double)data.data.price);
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(TowerUpgradeMessage((int)data.data.x, (int)data.data.y)));
                    break;
                case "HEALTH_UPDATE":
                    gameState.UpdateHealth((int)data.data.change);
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    if (gameState.GetHealth() == 0)
                        await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(new Message<string>("GAME_OVER", "GAME_OVER")));
                    break;
                case "RESET_GAME":
                    gameState.Reset();
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    break;
                case "GAME_OVER":
                    gameState.SetGameIsOver();
                    //gameState.SwitchGameActiveState();
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    break;
                default:
                    await Clients.All.SendAsync("serverDataMessage", jsonData);
                    break;
            }
        }

        private Message<Message_GameState> GetGameState(string messageType = "GAMESTATE_INIT")
        {
            Message_GameState messageGameState = new();
            messageGameState.map = gameState.GetMap().map;
            messageGameState.money = gameState.GetMoney();
            messageGameState.score = gameState.GetScore();
            messageGameState.health = gameState.GetHealth();
            messageGameState.bacterias = gameState.GetBacterias();
            messageGameState.gameActiveState = gameState.GetGameActiveState();
            messageGameState.gameIsOver = gameState.GetGameIsOver();

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
    }
}