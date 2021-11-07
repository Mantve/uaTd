using uaTdServer.Class;
using System;
using NUnit.Framework;
using System.Collections.Generic;

namespace uaTdServer.Tests.Class
{
    [TestFixture]
    public class Message_GameStateTests
    {
        private Message_GameState _testClass;

        [SetUp]
        public void SetUp()
        {
            _testClass = new Message_GameState();
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new Message_GameState();
            Assert.That(instance, Is.Not.Null);
        }

        [Test]
        public void CanSetAndGetmoney()
        {
            var testValue = 2028552274.98;
            _testClass.money = testValue;
            Assert.That(_testClass.money, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetscore()
        {
            var testValue = 1842395415.3;
            _testClass.score = testValue;
            Assert.That(_testClass.score, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGethealth()
        {
            var testValue = 1600115502;
            _testClass.health = testValue;
            Assert.That(_testClass.health, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetwave()
        {
            var testValue = 1917326234;
            _testClass.wave = testValue;
            Assert.That(_testClass.wave, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetplayers()
        {
            var testValue = new List<string>();
            _testClass.players = testValue;
            Assert.That(_testClass.players, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetbacterias()
        {
            var testValue = new List<Bacteria>();
            _testClass.bacterias = testValue;
            Assert.That(_testClass.bacterias, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetmap()
        {
            var testValue = new[,] { { 328911602 }, { 2088814758 }, { 2128363549 } };
            _testClass.map = testValue;
            Assert.That(_testClass.map, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetgameActiveState()
        {
            var testValue = false;
            _testClass.gameActiveState = testValue;
            Assert.That(_testClass.gameActiveState, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetgameIsOver()
        {
            var testValue = true;
            _testClass.gameIsOver = testValue;
            Assert.That(_testClass.gameIsOver, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetroundIsActive()
        {
            var testValue = false;
            _testClass.roundIsActive = testValue;
            Assert.That(_testClass.roundIsActive, Is.EqualTo(testValue));
        }
    }
}