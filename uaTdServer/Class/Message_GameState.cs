﻿using System;
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
        public int wave { get; set; }
        public List<string> players { get; set; }
        public List<Bacteria> bacterias { get; set; }
        public Map map { get; set; }
        public bool gameActiveState { get; set; }
        public bool gameIsOver { get; set; }
        public bool roundIsActive { get; set; }
        public int stage {get; set; }
    }
}