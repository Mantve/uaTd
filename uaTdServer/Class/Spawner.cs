using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;

namespace uaTdServer.Class
{
    public class Spawner
    {
        private static Spawner singleton;
        public static async void SpawnEnemies(IHubCallerClients clients)
        {
            bool isBlue = false;
            while (true)
            {
                if (!isBlue)
                {
                    await clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetEnemyMessage(new Bacteria(100, 0, new double[] { 0, 0 }, 0))));
                    isBlue = !isBlue;
                }
                else
                {
                    await clients.All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetEnemyMessage(new Bacteria(50, 0, new double[] { 0, 0 }, 1))));
                    isBlue = !isBlue;
                }
                Thread.Sleep(2000);
            }
        }

        private static Message<Bacteria> GetEnemyMessage(Bacteria bacteria, string messageType = "SPAWN_ENEMY")
        {
            Message<Bacteria> message = new Message<Bacteria>(messageType, bacteria);

            return new Message<Bacteria>(messageType, bacteria);
        }
    }
}
