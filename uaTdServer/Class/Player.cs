using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public class Player
    {
        public string Username { get; set; }
        public double Score { get; set; }
        public List<string> ConnectionIDs { get; set; }

        public Player(string username)
        {
            this.Username = username;
            Score = 0;
        }
    }
}
