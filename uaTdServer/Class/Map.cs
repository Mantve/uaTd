using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace uaTdServer.Class
{
    public struct MapObject {
        public int x { get; set; }
        public int y { get; set; }
        public int value { get; set; }
    }

    public class Map
    {
        public string name { get; set; }
        public int budget { get; set; }
        public int[] size { get; set; }

        public List<MapObject> objects { get; set; }

        public Map(int stage)
        {
            objects = new();
            ReadMap(stage);
        }

        public void ReadMap(int stage)
        {
            if(stage < 0)
                return;

            JObject mapData = JObject.Parse(File.ReadAllText(
                $"./Maps/map_{stage}.json"
            ));

            name = (string)mapData["name"];
            budget = (int)mapData["budget"];
            size = new int[]{(int)mapData["size"][0], (int)mapData["size"][1]};

            foreach (var obj in mapData["objects"])
            {
                objects.Add(new MapObject{
                    x = (int)obj["x"],
                    y = (int)obj["y"],
                    value = (int)obj["value"]
                });
            }
        }

        public void AddTower(int x, int y, int type)
        {
            objects.Add(new MapObject{
                x = x,
                y = y,
                value = type * 10
            });
        }

        public void UpgradeTower(int x, int y)
        {
            var index = objects.FindIndex(t => t.x == x && t.y == y);
            objects[index] = new MapObject(){
                x = objects[index].x,
                y = objects[index].y,
                value = objects[index].value + 1
            };
        }

        public void DowngradeTower(int x, int y)
        {
            var index = objects.FindIndex(t => t.x == x && t.y == y);
            objects[index] = new MapObject(){
                x = objects[index].x,
                y = objects[index].y,
                value = objects[index].value - 1
            };
        }

        public Map Clone()
        {
            Map clone = (Map)this.MemberwiseClone();

            clone.objects = new List<MapObject>(objects);
            clone.name = name;
            clone.size = size;
            clone.budget = budget;

            return clone;
        }
    }
}
