using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public class GameState
    {
        public double Money { get; set; }
        public double Score { get; set; }
        public double Difficulty { get; set; }
        public double Health { get; set; }
        public List<Player> Players { get; set; }

        public GameState()
        {
            Money = 1000;
            Score = 0;
            Difficulty = 1.0;
            Health = 100;

            Players = new List<Player>();
        }
    }
}
