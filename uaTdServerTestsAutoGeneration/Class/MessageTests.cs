using uaTdServer.Class;
using T = System.String;
using System;
using NUnit.Framework;

namespace uaTdServer.Tests.Class
{
    [TestFixture]
    public class Message_1Tests
    {
        private Message<T> _testClass;
        private string _type;
        private T _data;

        [SetUp]
        public void SetUp()
        {
            _type = "TestValue844348705";
            _data = "TestValue1246690367";
            _testClass = new Message<T>(_type, _data);
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new Message<T>();
            Assert.That(instance, Is.Not.Null);
            instance = new Message<T>(_type, _data);
            Assert.That(instance, Is.Not.Null);
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        public void CannotConstructWithInvalidType(string value)
        {
            Assert.Throws<ArgumentNullException>(() => new Message<T>(value, "TestValue1416061126"));
        }

        [Test]
        public void typeIsInitializedCorrectly()
        {
            Assert.That(_testClass.type, Is.EqualTo(_type));
        }

        [Test]
        public void CanSetAndGettype()
        {
            var testValue = "TestValue1868093792";
            _testClass.type = testValue;
            Assert.That(_testClass.type, Is.EqualTo(testValue));
        }

        [Test]
        public void dataIsInitializedCorrectly()
        {
            Assert.That(_testClass.data, Is.EqualTo(_data));
        }

        [Test]
        public void CanSetAndGetdata()
        {
            var testValue = "TestValue183937338";
            _testClass.data = testValue;
            Assert.That(_testClass.data, Is.EqualTo(testValue));
        }
    }
}