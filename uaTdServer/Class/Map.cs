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

        //public int[,] map;
        public int[,] map = {{0, -1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0},
                             {0, -1,  0,  0,  0,  0,  0,  0, -1, -1, -1, -1,  0},
                             {0, -1, -1, -1, -1, -1,  0,  0, -1,  0,  0, -1,  0},
                             {0,  0,  0, -7,  0, -1,  0,  0, -1,  0, -4, -1,  0},
                             {0,  0,  0,  0,  0, -1, -1, -1, -1,  0,  0, -1,  0},
                             {0,  -2,  0,  0,  0, 0, -5,  0,  0,  0,  0, -1,  0},
                             {0,  0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  0},
                             {0,  0, -1,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0},
                             {0,  0, -1,  -3,  0, -1, -1, -1, -1, -1, -1,  0,  0},
                             {0,  0, -1, -1, -1, -1,  0,  0,  0, -6, -1,  0,  0},
                             {0,  0,  0,  0,  0,  0,  0,  0,  0,  0, -1,  0,  0}};

        public Map(string name, int size, int budget)
        {
            Name = name;
            Size = size;
            Budget = budget;

            //map = new int[size, size];
        }

        public void SetTower(int x, int y)
        {
            map[y, x] = 1;
        }
    }
}
