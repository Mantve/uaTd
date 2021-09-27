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
                    Player player = gameState.players.FirstOrDefault(p => p.username == data.username);

                    if(player == null)
                    {
                        gameState.players.Add(new Player(data)); // TODO: parse data.data.username;

                        dynamic messageBody = new JObject();
                        messageBody.money = gameState.money;
                        messageBody.score = gameState.score;
                        messageBody.players = new JArray(gameState.players.Select(p => p.username).ToArray());

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