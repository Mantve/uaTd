using uaTdServer.Class;
using System;
using NUnit.Framework;

namespace uaTdServer.Tests.Class
{
    [TestFixture]
    public class Message_Tower_DowngradeTests
    {
        private Message_Tower_Downgrade _testClass;

        [SetUp]
        public void SetUp()
        {
            _testClass = new Message_Tower_Downgrade();
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new Message_Tower_Downgrade();
            Assert.That(instance, Is.Not.Null);
        }

        [Test]
        public void CanSetAndGetx()
        {
            var testValue = 789076529;
            _testClass.x = testValue;
            Assert.That(_testClass.x, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGety()
        {
            var testValue = 703827353;
            _testClass.y = testValue;
            Assert.That(_testClass.y, Is.EqualTo(testValue));
        }
    }
}