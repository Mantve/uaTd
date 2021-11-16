using System.Collections.Generic;

namespace uaTdServer.Class
{
    public struct Message_Load
    {
        public int playersCount { get; set; }
        public string[] loadedMaps { get; set; }
        
    }
}