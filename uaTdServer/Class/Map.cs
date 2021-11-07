﻿using System;
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

        public Map() { }

        public virtual int[,] GetMap()
        {
            return map;
        }

        public void SetTower(int x, int y, int type)
        {
            map[y, x] = type * 10;
        }

        public void UpgradeTower(int x, int y)
        {
            map[y, x]++;
        }

        public void DowngradeTower(int x, int y)
        {
            map[y, x]--;
        }

        public Map Clone()
        {
            Map clone = (Map)this.MemberwiseClone();
            clone.map = map.Clone() as int[,]; //map;
            clone.Name = Name;
            clone.Size = Size;
            clone.Budget = Budget;
            return clone;
        }
    }
}
