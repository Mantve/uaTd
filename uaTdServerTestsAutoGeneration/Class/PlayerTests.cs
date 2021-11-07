using uaTdServer.Class;
using System;
using NUnit.Framework;
using System.Collections.Generic;

namespace uaTdServer.Tests.Class
{
    [TestFixture]
    public class PlayerTests
    {
        private Player _testClass;
        private string _username;

        [SetUp]
        public void SetUp()
        {
            _username = "TestValue911274617";
            _testClass = new Player(_username);
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new Player(_username);
            Assert.That(instance, Is.Not.Null);
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        public void CannotConstructWithInvalidUsername(string value)
        {
            Assert.Throws<ArgumentNullException>(() => new Player(value));
        }

        [Test]
        public void UsernameIsInitializedCorrectly()
        {
            Assert.That(_testClass.Username, Is.EqualTo(_username));
        }

        [Test]
        public void CanSetAndGetUsername()
        {
            var testValue = "TestValue104146581";
            _testClass.Username = testValue;
            Assert.That(_testClass.Username, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetScore()
        {
            var testValue = 872623662.56999993;
            _testClass.Score = testValue;
            Assert.That(_testClass.Score, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetConnectionIDs()
        {
            var testValue = new List<string>();
            _testClass.ConnectionIDs = testValue;
            Assert.That(_testClass.ConnectionIDs, Is.EqualTo(testValue));
        }
    }
}