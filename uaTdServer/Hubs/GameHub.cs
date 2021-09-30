using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Linq;
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
                case "TOWER_PURCHASE":
                    gameState.UpdateMoney((double)data.data.change);

                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    break;
                case "TOWER_BUILD":
                    gameState.GetMap().SetTurret((int)data.data.xCoordinate, (int)data.data.yCoordinate);
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState("GAMESTATE_UPDATE")));
                    break;
                default:
                    await Clients.All.SendAsync("serverDataMessage", jsonData);
                    break;
            }
        }

        private Message<Message_GameState> GetGameState(string messageType = "GAMESTATE_INIT") { 
            Message_GameState messageGameState = new();
            messageGameState.map = gameState.GetMap().map;
            messageGameState.money = gameState.GetMoney();
            messageGameState.score = gameState.GetScore();

            return new Message<Message_GameState>(messageType, messageGameState);
        }
    }
}