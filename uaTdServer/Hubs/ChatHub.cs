using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace uaTdServer.Hubs
{
    public class ChatHub : Hub
    {
        public async Task ClientMessage(string jsonData)
        {
            await Clients.All.SendAsync("serverDataMessage", jsonData);
        }
    }
}