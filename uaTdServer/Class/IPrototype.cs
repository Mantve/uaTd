using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public interface IPrototype
    {
        public GameState ShallowCopy();
        public GameState DeepCopy();
    }
}
