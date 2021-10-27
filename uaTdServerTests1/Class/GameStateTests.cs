using uaTdServer.Class;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace uaTdServer.Class.Tests
{
    [TestClass()]
    public class GameStateTests
    {
        /*
        Since the game uses a singleton, to test it should be reset every test
        Or it is going to give old values and would be hard to work with
        */
        [TestInitialize()]
        public void Startup()
        {
            GameState game = GameState.Get();
            game.Reset();
            game.ResetPlayers();
        }


        [TestMethod()]
        public void GetTest()
        {
            GameState game = GameState.Get();

            Assert.AreEqual(game.GetMoney(), 1000, 0.01);
            Assert.AreEqual(game.GetHealth(), 100);
            Assert.AreEqual(game.GetWave(), 0);

            game.UpdateMoney(100);
            game.UpdateHealth(50);
            game.SetNextWave();

            Assert.AreEqual(game.GetMoney(), 1100, 0.01);
            Assert.AreEqual(game.GetHealth(), 50);
            Assert.AreEqual(game.GetWave(), 1);

            game = GameState.Get();

            Assert.AreEqual(game.GetMoney(), 1100, 0.01);
            Assert.AreEqual(game.GetHealth(), 50);
            Assert.AreEqual(game.GetWave(), 1);

            //Assert.Fail();
        }

        [TestMethod()]
        public void ResetTest()
        {
            GameState game = GameState.Get();

            Assert.AreEqual(game.GetMoney(), 1000, 0.01);
            Assert.AreEqual(game.GetHealth(), 100);
            Assert.AreEqual(game.GetWave(), 0);

            game.UpdateMoney(100);
            game.UpdateHealth(50);
            game.SetNextWave();

            Assert.AreEqual(game.GetMoney(), 1100, 0.01);
            Assert.AreEqual(game.GetHealth(), 50);
            Assert.AreEqual(game.GetWave(), 1);

            game.Reset();

            Assert.AreEqual(game.GetMoney(), 1000, 0.01);
            Assert.AreEqual(game.GetHealth(), 100);
            Assert.AreEqual(game.GetWave(), 0);

            //Assert.Fail();
        }

        [TestMethod()]
        public void ResetPlayers()
        {
            GameState game = GameState.Get();

            game.NewPlayer(new Player("Player 1"));
            game.NewPlayer(new Player("Player 2"));
            game.NewPlayer(new Player("Player 3"));

            Assert.AreEqual(game.GetPlayers().Count, 3);

            game.ResetPlayers();

            Assert.AreEqual(game.GetPlayers().Count, 0);
            //Assert.Fail();
        }

        [TestMethod()]
        public void ShallowCopyTest()
        {
            GameState game = GameState.Get();

            GameState shallowCopy = game.ShallowCopy();

            //Values that give back a reference are checked
            game.AddTower(0, 0, 0, 0);
            game.AddBacteria(100, 0, new double[] { 0, 0 }, 0);
            game.GetMap().map[0, 0] = 100;

            Assert.AreEqual(game.GetTowers(), shallowCopy.GetTowers());
            Assert.AreEqual(game.GetBacterias(), shallowCopy.GetBacterias());
            Assert.AreEqual(game.GetMap(), shallowCopy.GetMap());
            //Assert.Fail();
        }

        [TestMethod()]
        public void DeepCopyTest()
        {
            GameState game = GameState.Get();

            GameState shallowCopy = game.DeepCopy();

            //Values that give back a reference are checked
            game.AddTower(0, 0, 0, 0);
            game.AddBacteria(100, 0, new double[] { 0, 0 }, 0);
            game.GetMap().map[0, 0] = 100;

            Assert.AreNotEqual(game.GetTowers(), shallowCopy.GetTowers());
            Assert.AreNotEqual(game.GetBacterias(), shallowCopy.GetBacterias());
            Assert.AreNotEqual(game.GetMap(), shallowCopy.GetMap());
            //Assert.Fail();
        }

        [TestMethod()]
        public void GetPlayerByUsernameSuccessTest()
        {
            GameState game = GameState.Get();

            Player player = new Player("Player 1");

            game.NewPlayer(player);

            var getPlayer = game.GetPlayerByUsername("Player 1");

            Assert.AreEqual(player, getPlayer);
        }

        [TestMethod()]
        public void GetPlayerByUsernameFailTest()
        {
            GameState game = GameState.Get();

            Player player = new Player("Player 1");

            game.NewPlayer(player);

            var getPlayer = game.GetPlayerByUsername("Player 2");

            Assert.AreNotEqual(player, getPlayer);
        }

        [TestMethod()]
        public void NewPlayerTest()
        {
            GameState game = GameState.Get();
            int currentPlayers = game.GetPlayers().Count;

            game.NewPlayer(new Player("Some player"));
            Assert.AreEqual(game.GetPlayers().Count, currentPlayers + 1);
            //Assert.Fail();
        }

        [TestMethod()]
        public void GetMoneyTest()
        {
            GameState game = GameState.Get();

            Assert.AreEqual(game.GetMoney(), 1000, 0.01);
        }

        [TestMethod()]
        [DataRow(100)]
        [DataRow(200)]
        public void UpdateMoneyPositiveTest(double change)
        {
            GameState game = GameState.Get();

            double currentMoney = game.GetMoney();

            game.UpdateMoney(change);

            Assert.AreEqual(game.GetMoney(), currentMoney + change, 0.01);
            //Assert.Fail();
        }

        [TestMethod()]
        [DataRow(-100)]
        [DataRow(-200)]
        public void UpdateMoneyNegativeSuccessTest(double change)
        {
            GameState game = GameState.Get();

            double currentMoney = game.GetMoney();

            game.UpdateMoney(change);

            Assert.AreEqual(game.GetMoney(), currentMoney + change, 0.01);
            //Assert.Fail();
        }

        [TestMethod()]
        public void GetScoreTest()
        {
            GameState game = GameState.Get();

            Assert.AreEqual(game.GetScore(), 0);
        }

        [TestMethod()]
        public void UpdateScoreTest()
        {
            GameState game = GameState.Get();

            game.UpdateScore(100);

            Assert.AreEqual(game.GetScore(), 100);
        }

        [TestMethod()]
        public void GetHealthTest()
        {
            GameState game = GameState.Get();

            Assert.AreEqual(game.GetHealth(), 100);
        }

        [TestMethod()]
        [DataRow(10)]
        [DataRow(30)]
        [DataRow(60)]
        [DataRow(99)]
        public void UpdateHealthAboveZeroTest(int change)
        {
            GameState game = GameState.Get();

            int startingHealth = game.GetHealth();

            game.UpdateHealth(change);

            Assert.AreEqual(startingHealth - change, game.GetHealth());
            //Assert.Fail();
        }

        [TestMethod()]
        [DataRow(100)]
        [DataRow(150)]
        [DataRow(200)]
        public void UpdateHealthBelowZeroTest(int change)
        {
            GameState game = GameState.Get();

            game.UpdateHealth(change);

            Assert.AreEqual(game.GetHealth(), 0);
            //Assert.Fail();
        }

        [TestMethod()]
        public void GetPlayersTest()
        {
            GameState game = GameState.Get();

            game.NewPlayer(new Player("Player 1"));
            game.NewPlayer(new Player("Player 2"));
            game.NewPlayer(new Player("Player 3"));

            var players = game.GetPlayers();

            Assert.IsTrue(players.Contains("Player 1"));
            Assert.IsTrue(players.Contains("Player 2"));
            Assert.IsTrue(players.Contains("Player 3"));
        }

        [TestMethod()]
        public void GetMapTest()
        {
            GameState game = GameState.Get();

            Assert.AreEqual(game.GetMap().Budget, 1000);
            Assert.AreEqual(game.GetMap().Size, 64);
            Assert.AreEqual(game.GetMap().Name, "Map");
        }

        [TestMethod()]
        public void AddTowerEnoughMoneyTest()
        {
            GameState game = GameState.Get();

            int towerCount = game.GetTowers().Count;
            game.AddTower(0, 0, 0, 100);

            Assert.AreEqual(towerCount + 1, game.GetTowers().Count);

            //Assert.Fail();
        }

        [TestMethod()]
        public void AddTowerNotEnoughMoneyTest()
        {
            GameState game = GameState.Get();

            int towerCount = game.GetTowers().Count;
            game.AddTower(0, 0, 0, 10000000);

            Assert.AreEqual(towerCount, game.GetTowers().Count);
            //Assert.Fail();
        }

        [TestMethod()]
        public void UpgradeTowerEnoughMoneyTest()
        {
            GameState game = GameState.Get();

            game.AddTower(0, 0, 0, 100);

            int towerType = game.GetMap().map[0, 0];

            game.UpgradeTower(0, 0, 100);

            int towerTypeAfterUpgrade = game.GetMap().map[0, 0];

            Assert.AreNotEqual(towerType, towerTypeAfterUpgrade);
        }

        [TestMethod()]
        public void UpgradeTowerNotEnoughMoneyTest()
        {
            GameState game = GameState.Get();

            game.AddTower(0, 0, 0, 100);

            int towerType = game.GetMap().map[0, 0];

            game.UpgradeTower(0, 0, 100000);

            int towerTypeAfterUpgrade = game.GetMap().map[0, 0];

            Assert.AreEqual(towerType, towerTypeAfterUpgrade);
        }

        [TestMethod()]
        public void GetTowersTest()
        {
            GameState game = GameState.Get();

            Assert.AreEqual(game.GetTowers().Count, 0);
        }

        [TestMethod()]
        public void AddBacteriaTest()
        {
            GameState game = GameState.Get();

            game.AddBacteria(100, 0, new double[] { 0, 0 }, 0);

            Assert.AreEqual(game.GetBacterias().Count, 1);
        }

        [TestMethod()]
        public void RemoveBacteriaTest()
        {
            GameState game = GameState.Get();

            game.AddBacteria(100, 0, new double[] { 0, 0 }, 0);
            game.AddBacteria(100, 0, new double[] { 0, 0 }, 0);

            game.RemoveBacteria((int)game.GetBacterias().ElementAt(0).id);

            Assert.AreEqual(game.GetBacterias().Count, 1);
        }

        [TestMethod()]
        public void GetBacteriasTest()
        {
            GameState game = GameState.Get();

            Assert.AreEqual(game.GetBacterias().Count, 0);
        }

        [TestMethod()]
        public void GetGameActiveStateTest()
        {
            GameState game = GameState.Get();

            Assert.IsFalse(game.GetGameActiveState());
        }

        [TestMethod()]
        public void SwitchGameActiveStateTest()
        {
            GameState game = GameState.Get();

            game.SwitchGameActiveState();

            Assert.IsTrue(game.GetGameActiveState());
            //Assert.Fail();
        }

        [TestMethod()]
        public void ResetBacteriasTest()
        {
            GameState game = GameState.Get();

            game.AddBacteria(100, 0, new double[] { 0, 0 }, 0);
            game.AddBacteria(100, 0, new double[] { 0, 0 }, 0);
            game.AddBacteria(100, 0, new double[] { 0, 0 }, 0);
            game.AddBacteria(100, 0, new double[] { 0, 0 }, 0);

            game.ResetBacterias();

            Assert.AreEqual(game.GetBacterias().Count, 0);

            //Assert.Fail();
        }

        [TestMethod()]
        public void GetGameIsOverTest()
        {
            GameState game = GameState.Get();

            Assert.IsFalse(game.GetGameIsOver());
        }

        [TestMethod()]
        public void SetGameIsOverTest()
        {
            GameState game = GameState.Get();

            //bool startingGameIsOver = game.GetGameIsOver();

            game.SetGameIsOver();

            Assert.IsTrue(game.GetGameIsOver());
        }

        [TestMethod()]
        public void GetWaveTest()
        {
            GameState game = GameState.Get();

            Assert.AreEqual(game.GetWave(), 0);
        }

        [TestMethod()]
        public void SetNextWaveTest()
        {
            GameState game = GameState.Get();

            int startingWave = game.GetWave();

            game.SetNextWave();

            Assert.AreEqual(game.GetWave(), startingWave + 1);
            //Assert.Fail();
        }

        [TestMethod()]
        public void GetRoundIsActiveTest()
        {
            GameState game = GameState.Get();

            Assert.IsFalse(game.GetRoundIsActive());
        }

        [TestMethod()]
        public void SetRoundIsActiveTest()
        {
            GameState game = GameState.Get();

            bool startingRoundIsActiveState = game.GetRoundIsActive();

            game.SetRoundIsActive();

            Assert.AreNotEqual(startingRoundIsActiveState, game.GetRoundIsActive());
        }
    }
}