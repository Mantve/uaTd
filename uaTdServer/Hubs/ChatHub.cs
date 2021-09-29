using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Linq;
using System.Threading.Tasks;
using uaTdServer.Class;

namespace uaTdServer.Hubs
{
    public class ChatHub : Hub
    {
        GameState gameState = new();
        public async Task ClientMessage(string jsonData)
        {
            var data = JsonConvert.DeserializeObject<dynamic>(jsonData);

            int messageType = data.type;
            switch (messageType)
            {
                case 0:
                    Player player = gameState.Players.FirstOrDefault(p => p.Username == data.username);
                    var username = data.data.username.ToString();

                    if (player == null)
                    {
                        gameState.Players.Add(new Player(username)); 

                        dynamic messageBody = new JObject();
                        messageBody.money = gameState.Money;
                        messageBody.score = gameState.Score;
                        messageBody.players = new JArray(gameState.Players.Select(p => p.Username).ToArray());

                        dynamic messageMain = new JObject();

                        messageMain.type = 1;
                        messageMain.data = messageBody;

                        // Send caller current game state
                        await Clients.Caller.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(messageMain));

                        // Notify others of a new player
                        await Clients.Others.SendAsync("serverDataMessage", jsonData);
                    }
                    else
                    {
                        await Clients.All.SendAsync("serverDataMessage", jsonData);
                    }
                    break;
                default:
                    await Clients.All.SendAsync("serverDataMessage", jsonData);
                    break;
            }

        }
    }
}