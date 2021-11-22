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
        public static List<SpawnerStruct> spawnList;

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
            Bacteria bacteria;
            gameState.SetRoundIsActive();
            setWave(gameState);
            for (int i = 0; i < spawnList.Count; i++)
            {
                if(gameState.GetHealth() <= 0) //Game is over
                {
                    break;
                }
                while(!gameState.GetGameActiveState()) {} //Game is not active and should not spawn enemies

                SpawnerStruct enemySpawn = spawnList[i];
                bacteria = gameState.AddBacteria(enemySpawn.Type == 0 ? 100 : 50, 0, new double[] { 0, 0 }, enemySpawn.Type);

                await Get().GetClients().All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetEnemyMessage(bacteria)));
                Thread.Sleep(enemySpawn.Delay);
            }
            while (!gameState.GetGameIsOver() && gameState.GetBacterias().Count > 0) { } //Game is not over and there are bacterias
            gameState.SetNextWave();
            gameState.SetRoundIsActive();
            gameState.SwitchGameActiveState();
            await Get().GetClients().All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetGameState(gameState, "ROUND_OVER")));
            /*
            bool isBlue = false;
            while (gameState.GetHealth() > 0)
            {
                Bacteria bacteria = gameState.AddBacteria(isBlue ? 100 : 50, 0, new double[] { 0, 0 }, isBlue ? 0 : 1);
                isBlue = !isBlue;

                await Get().GetClients().All.SendAsync("serverDataMessage", (string)JsonConvert.SerializeObject(GetEnemyMessage(bacteria)));
                Thread.Sleep(2000);
            }
            */
        }

        private static Message<Bacteria> GetEnemyMessage(Bacteria bacteria, string messageType = "SPAWN_ENEMY")
        {
            Message<Bacteria> message = new Message<Bacteria>(messageType, bacteria);

            return new Message<Bacteria>(messageType, bacteria);
        }

        private static Message<Message_GameState> GetGameState(GameState gameState, string messageType = "GAMESTATE_INIT")
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

            return new Message<Message_GameState>(messageType, messageGameState);
        }

        private static void setWave(GameState gameState)
        {
            spawnList = new List<SpawnerStruct>();
            switch(gameState.GetWave())
            {
                case 0:
                    setWave0();
                    break;
                case 1:
                    setWave1();
                    break;
                default:
                    setWave0();
                    break;
            }
        }

        private static void setWave0()
        {
            //spawnList.Add(new SpawnerStruct(0, 2000));
            
            for(int i = 0; i < 10; i++)
            {
                spawnList.Add(new SpawnerStruct(0, 2000));
            }
            
        }
        private static void setWave1()
        {
            for (int i = 0; i < 9; i++)
            {
                spawnList.Add(new SpawnerStruct(0, 1500));
                //spawnList.Add(new SpawnerStruct(0, 100));
            }
            spawnList.Add(new SpawnerStruct(1, 1500));
        }

        public struct SpawnerStruct
        {
            public int Type { get; set; }
            public int Delay { get; set; }
            public SpawnerStruct(int type, int delay) {
                Type = type;
                Delay = delay;
            }
        }
    }
}