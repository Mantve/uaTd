using uaTdServer.Class;
using System;
using NUnit.Framework;
using NSubstitute;
using Microsoft.AspNetCore.SignalR;

namespace uaTdServer.Tests.Class
{
    [TestFixture]
    public class SpawnerTests
    {
        private Spawner _testClass;

        [SetUp]
        public void SetUp()
        {
            _testClass = Spawner.Get();
        }

        [Test]
        public void CanCallGet()
        {
            var result = Spawner.Get();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallSetClients()
        {
            var clients = Substitute.For<IHubCallerClients>();
            _testClass.SetClients(clients);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CannotCallSetClientsWithNullClients()
        {
            Assert.Throws<ArgumentNullException>(() => _testClass.SetClients(default(IHubCallerClients)));
        }

        [Test]
        public void CanCallGetClients()
        {
            var result = _testClass.GetClients();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallSpawnEnemies()
        {
            var gameState = GameState.Get();
            Spawner.SpawnEnemies(gameState);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CannotCallSpawnEnemiesWithNullGameState()
        {
            Assert.Throws<ArgumentNullException>(() => Spawner.SpawnEnemies(default(GameState)));
        }
    }
}