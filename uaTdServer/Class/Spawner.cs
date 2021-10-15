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

        private Spawner() { }

        public static Spawner Get()
        {
            if (singleton == null)
                singleton = new();

            return singleton;
        }

        private IHubCallerClients clients;

        public void SetClients(IHubCallerClients clients)
        {
            this.clients = clients;
        }

        public IHubCallerClients GetClients()
        {
            return clients;
        }

        public static async void SpawnEnemies(GameState gameState)
        {
            bool isBlue = false;
            while (gameState.GetGameActiveState() && gameState.GetHealth() > 0)
            {
                Bacteria bacteria = gameState.AddBacteria(isBlue ? 100 : 50, 0, new double[] { 0, 0 }, isBlue ? 0 : 1);
                isBlue = !isBlue;

                await Get().GetClients().All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetEnemyMessage(bacteria)));
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