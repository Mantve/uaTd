using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public class GameState
    {
        public double money { get; set; }
        public double score { get; set; }
        public double difficulty { get; set; }
        public double health { get; set; }
        public List<Player> players { get; set; }

        public GameState()
        {
            money = 1000;
            score = 0;
            difficulty = 1.0;
            health = 100;

            players = new List<Player>();
        }
    }
}
