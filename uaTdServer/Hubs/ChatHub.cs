using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System.Linq;
using System.Threading.Tasks;
using uaTdServer.Class;

namespace uaTdServer.Hubs
{
    public class ChatHub : Hub
    {
        GameState gameState = new GameState();
        public async Task ClientMessage(string jsonData)
        {
            var data = JsonConvert.DeserializeObject<dynamic>(jsonData);

            int messageType = data.type;
            switch (messageType)
            {
                case 0:
                    var existingPlayer = gameState.players.FirstOrDefault(p => p.username == data.data.username);
                    if(existingPlayer == null)
                    {
                        gameState.players.Add(new Player(data.data.username));

                        await Clients.Caller.SendAsync("serverDataMessage", jsonData); // TODO: return the caller that they have logged in successfully
                        await Clients.Others.SendAsync("serverDataMessage", jsonData); // TODO: send other clients that a new player has joined
                    }

                    break;
                default:
                    await Clients.All.SendAsync("serverDataMessage", jsonData);
                    break;
            }
        }
    }
}