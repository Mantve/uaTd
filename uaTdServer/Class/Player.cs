using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public class Player
    {
        public string username { get; set; }
        public double score { get; set; }

        public Player(string username)
        {
            this.username = username;
            score = 0;
        }
    }
}
