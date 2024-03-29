﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public struct Vector2
    {
        public double x { get; set; }
        public double y { get; set; }
    }

    public struct BacteriaFollower
    {
        public int t { get; set; }
        public Vector2 vec { get; set; }
    }

    public class Bacteria
    {
        public long id { get; set; }
        public double health { get; set; }
        public int hitCount { get; set; }
        public bool isDead { get; set; }
        public BacteriaFollower follower { get; set; }
        public int type { get; set; }
        public long spawnTime { get; set; }

        public Bacteria(double health, int t, double[] vec, int type)
        {
            id = Counter.getId();
            this.health = health;
            hitCount = 0;
            isDead = false;
            this.type = type;
            this.spawnTime = DateTimeOffset.Now.ToUnixTimeSeconds();

            Vector2 newVec;

            if (vec != null)
            {
                newVec = new()
                {
                    x = vec[0],
                    y = vec[1]
                };
            }
            else
            {
                newVec = new()
                {
                    x = 0,
                    y = 0
                };
            }

            follower = new()
            {
                t = t,
                vec = newVec
            };
        }

        public Bacteria registerHit(int hitNo, double damage)
        {
            if (hitCount == hitNo)
            {
                health -= damage;

                if (health <= 0)
                {
                    isDead = true;
                }
            }

            return this;
        }
    }

    public static class Counter
    {
        private static int id = 0;

        public static int getId()
        {
            return id++;
        }
    }
}