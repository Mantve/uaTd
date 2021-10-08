using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public class GameState
    {
        private static GameState singleton;

        Dictionary<string, Player> playersByUsername;
        Dictionary<string, Player> playersByConnectionID;
        Map Map;
        double Money;
        double Score;
        int Health;
        List<(int, int)> Towers;
        List<Bacteria> Bacterias;
        public bool gameIsActive = false;

        private GameState()
        {
            playersByUsername = new Dictionary<string, Player>();
            playersByConnectionID = new Dictionary<string, Player>();
            Money = 1000;
            Score = 0;
            Health = 100;
            Map = new Map("Map", 64, 1000);
            Towers = new();
            Bacterias = new();
        }

        public static GameState Get()
        {
            if (singleton == null)
                singleton = new GameState();

            return singleton;
        }

        public Player GetPlayerByUsername(string username)
        {
            if (playersByUsername.ContainsKey(username))
                return playersByUsername[username];

            return null;
        }

        /*public Player GetPlayerByConnectionID(string connectionID)
        {
            if (playersByConnectionID.ContainsKey(connectionID))
                return playersByConnectionID[connectionID];

            return null;
        }*/

        public void NewPlayer(Player player)
        {
            playersByUsername.Add(player.Username, player);
            /*foreach (string connectionID in player.ConnectionIDs)
                playersByConnectionID.Add(connectionID, player);*/
        }

        public void NewConnection(string username, string connectionID)
        {
            playersByConnectionID.Add(connectionID, playersByUsername[username]);
            playersByUsername[username].ConnectionIDs.Add(connectionID);
        }

        public double GetMoney()
        {
            return Money;
        }

        public void UpdateMoney(double change)
        {
            Money -= change;
        }

        public double GetScore()
        {
            return Score;
        }

        public void UpdateScore(double change)
        {
            Score -= change;
        }

        public int GetHealth()
        {
            return Health;
        }

        public void UpdateHealth(int change)
        {
            Health -= change;
        }

        public List<String> GetPlayers()
        {
            return playersByUsername.Keys.ToList();
        }

        public Map GetMap()
        {
            return Map;
        }

        public void AddTower(int x, int y)
        {
            var existingTower = Towers.Any(t => t == (x, y));
            if(!existingTower)
            {
                Towers.Add((x, y));
                GetMap().SetTower(x, y);
            }
        }

        public List<(int, int)> GetTowers()
        {
            return Towers;
        }

        public Bacteria AddBacteria(double health, int t = 0, double[] vec = null, int type = 0)
        {
            Bacteria newBacteria = new(health, t, vec, type);
            Bacterias.Add(newBacteria);

            return newBacteria;
        }

        public void RemoveBacteria(long id)
        {
            Bacterias.RemoveAll(x => x.id == id);
        }

        public List<Bacteria> GetBacterias()
        {
            return Bacterias;
        }
    }
}
