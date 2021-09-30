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

            int messageType = data.type;

            switch (messageType)
            {
                case 0:
                    string username = (string)data.data.username;
                    if (!gameState.GetPlayers().Contains(username))
                        gameState.NewPlayer(new Player(username));

                    // Send caller current game state
                    await Clients.Caller.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState()));

                    // Notify others of a new player
                    await Clients.Others.SendAsync("serverDataMessage", jsonData);
                    break;
                case 100:
                    gameState.UpdateMoney((double)data.data.change);

                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState(3)));
                    break;
                case 300:
                    int xcoord = (int)data.data.xCoordinate;
                    gameState.GetMap().SetTurret((int)data.data.xCoordinate, (int)data.data.yCoordinate);
                    await Clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState(3)));
                    break;
                default:
                    await Clients.All.SendAsync("serverDataMessage", jsonData);
                    break;
            }
        }

        private JObject GetGameState(int messageType = 1)
        {
            dynamic messageBody = new JObject();
            dynamic messageMain = new JObject();

            messageBody.money = gameState.GetMoney();
            messageBody.score = gameState.GetScore();
            messageBody.players = new JArray(gameState.GetPlayers());
            messageBody.map = new JArray(gameState.GetMap().map.Cast<int>().ToArray());

            messageMain.type = messageType;
            messageMain.data = messageBody;

            return messageMain;
        }
    }
}