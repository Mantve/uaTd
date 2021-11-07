using uaTdServer.Class;
using System;
using NUnit.Framework;

namespace uaTdServer.Tests.Class
{
    [TestFixture]
    public class Message_Tower_BuildTests
    {
        private Message_Tower_Build _testClass;

        [SetUp]
        public void SetUp()
        {
            _testClass = new Message_Tower_Build();
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new Message_Tower_Build();
            Assert.That(instance, Is.Not.Null);
        }

        [Test]
        public void CanSetAndGetx()
        {
            var testValue = 508411668;
            _testClass.x = testValue;
            Assert.That(_testClass.x, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGety()
        {
            var testValue = 1930900210;
            _testClass.y = testValue;
            Assert.That(_testClass.y, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGettype()
        {
            var testValue = 1236297067;
            _testClass.type = testValue;
            Assert.That(_testClass.type, Is.EqualTo(testValue));
        }
    }
}