using uaTdServer.Class;
using System;
using NUnit.Framework;

namespace uaTdServer.Tests.Class
{
    [TestFixture]
    public class GameStateTests
    {
        private GameState _testClass;

        [SetUp]
        public void SetUp()
        {
            _testClass = GameState.Get();
        }

        [Test]
        public void CanCallGet()
        {
            var result = GameState.Get();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallReset()
        {
            _testClass.Reset();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallResetPlayers()
        {
            _testClass.ResetPlayers();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallShallowCopy()
        {
            var result = _testClass.ShallowCopy();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallDeepCopy()
        {
            var result = _testClass.DeepCopy();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetPlayerByUsername()
        {
            var username = "TestValue1594708867";
            var result = _testClass.GetPlayerByUsername(username);
            Assert.Fail("Create or modify test");
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        public void CannotCallGetPlayerByUsernameWithInvalidUsername(string value)
        {
            Assert.Throws<ArgumentNullException>(() => _testClass.GetPlayerByUsername(value));
        }

        [Test]
        public void GetPlayerByUsernamePerformsMapping()
        {
            var username = "TestValue786642470";
            var result = _testClass.GetPlayerByUsername(username);
            Assert.That(result.Username, Is.EqualTo(username));
        }

        [Test]
        public void CanCallNewPlayer()
        {
            var player = new Player("TestValue2054244365");
            _testClass.NewPlayer(player);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CannotCallNewPlayerWithNullPlayer()
        {
            Assert.Throws<ArgumentNullException>(() => _testClass.NewPlayer(default(Player)));
        }

        [Test]
        public void CanCallGetMoney()
        {
            var result = _testClass.GetMoney();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallUpdateMoney()
        {
            var change = 1910333619.81;
            _testClass.UpdateMoney(change);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetScore()
        {
            var result = _testClass.GetScore();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallUpdateScore()
        {
            var change = 1357547277.24;
            _testClass.UpdateScore(change);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetHealth()
        {
            var result = _testClass.GetHealth();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallUpdateHealth()
        {
            var change = 20341299;
            _testClass.UpdateHealth(change);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetPlayers()
        {
            var result = _testClass.GetPlayers();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetMap()
        {
            var result = _testClass.GetMap();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallAddTower()
        {
            var x = 1956968204;
            var y = 124135048;
            var type = 179072394;
            var price = 2087452373.49;
            _testClass.AddTower(x, y, type, price);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallUpgradeTower()
        {
            var x = 1251539725;
            var y = 1561750139;
            var price = 715593206.79;
            _testClass.UpgradeTower(x, y, price);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallDowngradeTower()
        {
            var x = 1283396888;
            var y = 44860223;
            _testClass.DowngradeTower(x, y);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetTowers()
        {
            var result = _testClass.GetTowers();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallAddBacteria()
        {
            var health = 1256493533.1299999;
            var t = 148668053;
            var vec = new[] { 1413624499.65, 1929056180.04, 1473224747.94 };
            var type = 1554779203;
            var result = _testClass.AddBacteria(health, t, vec, type);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CannotCallAddBacteriaWithNullVec()
        {
            Assert.Throws<ArgumentNullException>(() => _testClass.AddBacteria(1253139292.35, 845311359, default(double[]), 2073364463));
        }

        [Test]
        public void AddBacteriaPerformsMapping()
        {
            var health = 879512353.83;
            var t = 960318437;
            var vec = new[] { 1255618161.27, 1434070970.64, 337311300.15 };
            var type = 1090258974;
            var result = _testClass.AddBacteria(health, t, vec, type);
            Assert.That(result.health, Is.EqualTo(health));
            Assert.That(result.type, Is.EqualTo(type));
        }

        [Test]
        public void CanCallRemoveBacteria()
        {
            var id = 1319461222;
            _testClass.RemoveBacteria(id);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetBacterias()
        {
            var result = _testClass.GetBacterias();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetGameActiveState()
        {
            var result = _testClass.GetGameActiveState();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallSwitchGameActiveState()
        {
            _testClass.SwitchGameActiveState();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallResetBacterias()
        {
            _testClass.ResetBacterias();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetGameIsOver()
        {
            var result = _testClass.GetGameIsOver();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallSetGameIsOver()
        {
            _testClass.SetGameIsOver();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetWave()
        {
            var result = _testClass.GetWave();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallSetNextWave()
        {
            _testClass.SetNextWave();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallGetRoundIsActive()
        {
            var result = _testClass.GetRoundIsActive();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallSetRoundIsActive()
        {
            _testClass.SetRoundIsActive();
            Assert.Fail("Create or modify test");
        }
    }
}