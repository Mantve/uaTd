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
        public List<string> players { get; set; }
        public int[,] map { get; set; }
    }
}
