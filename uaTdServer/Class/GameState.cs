using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public class GameState
    {
        private GameState()
        {
            playersByUsername = new Dictionary<string, Player>();
            playersByConnectionID = new Dictionary<string, Player>();
            Money = 1000;
            Score = 0;
            Map = new Map("Map", 64, 1000);
        }

        private static GameState singleton;
        public static GameState Get()
        {
            if (singleton == null)
                singleton = new GameState();

            return singleton;
        }

        Dictionary<string, Player> playersByUsername;
        Dictionary<string, Player> playersByConnectionID;
        Map Map;

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

        double Money;
        double Score;

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
        public List<String> GetPlayers()
        {
            return playersByUsername.Keys.ToList();
        }
        public Map GetMap()
        {
            return Map;
        }
    }
}
