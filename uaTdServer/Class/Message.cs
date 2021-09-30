using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace uaTdServer.Class
{
    public class Message<T>
    {
        public string type { get; set; }
        public T data { get; set; }
        public Message() { }
        public Message(string type, T data)
        {
            this.type = type;
            this.data = data;
        }
    }
}
