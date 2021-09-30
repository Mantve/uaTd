using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public class Map
    {
        public string Name { get; set; }
        public int Size { get; set; }
        public int Budget { get; set; }

        //public int[,} map;
        public int[,] map = {{0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                            {0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 },
                            {0, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0},
                            {0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0},
                            {0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0},
                            {0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0},
                            {0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0},
                            {0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0},
                            {0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0},
                            {0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0},
                            {0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0}};

        public Map(string name, int size, int budget)
        {
            Name = name;
            Size = size;
            Budget = budget;

            //map = new int[size, size};
        }

        public void SetTurret(int i, int j)
        {
            map[i, j] = 1;
        }
    }
}
