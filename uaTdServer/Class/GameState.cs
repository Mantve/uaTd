using System;
using System.Collections.Generic;
using System.Linq;

namespace uaTdServer.Class
{
    public class GameState : IPrototype
    {
        private static GameState singleton = new GameState();
        /*readonly Dictionary<int, double> TowerCosts = new()
        {
            { 1, 100}, //shooter
            { 2, 200}  //village
        };*/
        Dictionary<string, Player> playersByUsername;
        Map Map;
        double Money;
        double Score;
        int Health;
        int Wave;
        List<(int, int)> Towers;
        List<Bacteria> Bacterias;
        bool gameActiveState = false;
        bool roundIsActive = false;
        bool gameIsOver = false;

        static GameState() { }

        private GameState()
        {
            playersByUsername = new Dictionary<string, Player>();
            this.Reset();
        }

        // for mock test
        //public GameState() { }

        public static GameState Get()
        {
            return singleton;
        }

        public void Reset() 
        {
            Money = 1000;
            Score = 0;
            Health = 100;
            Wave = 0;
            Map = new Map("Map", 64, 1000);
            Towers = new();
            Bacterias = new();
            gameActiveState = false;
            gameIsOver = false;
            roundIsActive = false;
        }

        public void ResetPlayers()
        {
            playersByUsername = new();
        }

        public GameState ShallowCopy()
        {
            return (GameState)this.MemberwiseClone();
        }

        public GameState DeepCopy()
        {
            GameState clone = (GameState)this.MemberwiseClone();
            clone.Money = Money;
            clone.Score = Score;
            clone.Health = Health;
            clone.Wave = Wave;
            clone.Map = Map.Clone();
            clone.Towers = Towers.Select(tower => (tower.Item1, tower.Item2)).ToList();
            clone.Bacterias = Bacterias.Select(bacteria => new Bacteria(bacteria.health, bacteria.follower.t, new double[] { bacteria.follower.vec.x, bacteria.follower.vec.y }, bacteria.type)).ToList();
            clone.gameActiveState = gameActiveState;
            clone.gameIsOver = gameIsOver;
            clone.roundIsActive = roundIsActive;
            return clone;
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

        public double GetMoney()
        {
            return Money;
        }

        public void UpdateMoney(double change)
        {
            Money += change;
        }

        public double GetScore()
        {
            return Score;
        }

        public void UpdateScore(double change)
        {
            Score += change;
        }

        public int GetHealth()
        {
            return Health;
        }

        public void UpdateHealth(int change)
        {
            if (Health - change > 0)
            {
                Health -= change;
            }
            else
            {
                Health = 0;
                ResetBacterias();
            }
        }

        public virtual List<String> GetPlayers()
        {
            return playersByUsername.Keys.ToList();
        }

        public Map GetMap()
        {
            return Map;
        }

        public void AddTower(int x, int y, int type, double price)
        {
            var existingTower = Towers.Any(t => t == (x, y));
            if(!existingTower)
            {
                UpdateMoney(-price);
                Towers.Add((x, y));
                GetMap().SetTower(x, y, type);
            }
        }

        public void UpgradeTower(int x, int y, double price)
        {
            var existingTower = Towers.Any(t => t == (x, y));
            if(existingTower)
            {
                UpdateMoney(-price);
                GetMap().UpgradeTower(x, y);
            }
        }

        public void DowngradeTower(int x, int y)
        {
            var existingTower = Towers.Any(t => t == (x, y));
            if(existingTower)
            {
                UpdateMoney(50);
                GetMap().DowngradeTower(x, y);
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

        public void RemoveBacteria(int id)
        {
            Bacterias.RemoveAll(x => x.id == id);
        }

        public List<Bacteria> GetBacterias()
        {
            return Bacterias;
        }

        public bool GetGameActiveState()
        {
            return gameActiveState;
        }

        public void SwitchGameActiveState()
        {
            gameActiveState = !gameActiveState;
        }
        public void ResetBacterias()
        {
            Bacterias = new List<Bacteria>();
        }

        public bool GetGameIsOver()
        {
            return gameIsOver;
        }

        public void SetGameIsOver()
        {
            gameIsOver = true;
        }

        public int GetWave()
        {
            return Wave;
        }

        public void SetNextWave()
        {
            Wave++;
        }

        public bool GetRoundIsActive()
        {
            return roundIsActive;
        }

        public void SetRoundIsActive()
        {
            roundIsActive = !roundIsActive;
        }
    }
}
