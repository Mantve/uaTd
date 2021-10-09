using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public struct Message_GameState
    {
        public double money { get; set; }
        public double score { get; set; }
        public int health { get; set; }
        public List<string> players { get; set; }
        public List<Bacteria> bacterias { get; set; }
        public int[,] map { get; set; }
        public bool gameActiveState { get; set; }
        public double gameTimer { get; set; }
    }
}
