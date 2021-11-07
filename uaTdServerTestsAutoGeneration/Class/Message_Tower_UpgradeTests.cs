using uaTdServer.Class;
using System;
using NUnit.Framework;

namespace uaTdServer.Tests.Class
{
    [TestFixture]
    public class Message_Tower_UpgradeTests
    {
        private Message_Tower_Upgrade _testClass;

        [SetUp]
        public void SetUp()
        {
            _testClass = new Message_Tower_Upgrade();
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new Message_Tower_Upgrade();
            Assert.That(instance, Is.Not.Null);
        }

        [Test]
        public void CanSetAndGetx()
        {
            var testValue = 1544904122;
            _testClass.x = testValue;
            Assert.That(_testClass.x, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGety()
        {
            var testValue = 1814654918;
            _testClass.y = testValue;
            Assert.That(_testClass.y, Is.EqualTo(testValue));
        }
    }
}