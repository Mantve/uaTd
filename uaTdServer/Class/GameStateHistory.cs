using System.Collections.Generic;

namespace uaTdServer.Class
{
    // Caretaker for Memento pattern
    public class GameStateHistory
    {
        private static GameStateHistory singleton = new GameStateHistory();
        public GameState Originator { get; set; }
        public List<Memento> History { get; set; }

        private GameStateHistory()
        {
            this.Originator = null;
            this.History = new List<Memento>();
        }

        public static GameStateHistory Get() {
            return singleton;
        }

        public void SetOriginator(GameState originator) {
            if (this.Originator == null) this.Originator = originator;
        }

        public void AppendHistory() {
            Memento memento = this.Originator.Save();
            this.History.Add(memento);
        }

        public void Undo() {
            if (this.History.Count != 0) {
                Memento memento = this.History[this.History.Count-1];
                this.History.Remove(memento);
                Originator.Restore(memento);
            }
        }
    }
}