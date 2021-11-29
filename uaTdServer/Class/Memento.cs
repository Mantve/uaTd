namespace uaTdServer.Class
{
    public class Memento
    {
        public GameState State { get; set; }

        public Memento(GameState State)
        {
            this.State = State;
        }

        public GameState GetState() {
            return this.State;
        }
    }
}