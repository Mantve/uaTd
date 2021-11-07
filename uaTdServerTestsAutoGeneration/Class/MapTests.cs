using uaTdServer.Class;
using System;
using NUnit.Framework;

namespace uaTdServer.Tests.Class
{
    [TestFixture]
    public class MapTests
    {
        private Map _testClass;
        private string _name;
        private int _size;
        private int _budget;

        [SetUp]
        public void SetUp()
        {
            _name = "TestValue547712372";
            _size = 16846017;
            _budget = 1055650150;
            _testClass = new Map(_name, _size, _budget);
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new Map(_name, _size, _budget);
            Assert.That(instance, Is.Not.Null);
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        public void CannotConstructWithInvalidName(string value)
        {
            Assert.Throws<ArgumentNullException>(() => new Map(value, 372122271, 2088197289));
        }

        [Test]
        public void CanCallSetTower()
        {
            var x = 387747344;
            var y = 375145510;
            var type = 2138812678;
            _testClass.SetTower(x, y, type);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallUpgradeTower()
        {
            var x = 520111499;
            var y = 998210796;
            _testClass.UpgradeTower(x, y);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallDowngradeTower()
        {
            var x = 222352920;
            var y = 23233676;
            _testClass.DowngradeTower(x, y);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanCallClone()
        {
            var result = _testClass.Clone();
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void NameIsInitializedCorrectly()
        {
            Assert.That(_testClass.Name, Is.EqualTo(_name));
        }

        [Test]
        public void CanSetAndGetName()
        {
            var testValue = "TestValue515839048";
            _testClass.Name = testValue;
            Assert.That(_testClass.Name, Is.EqualTo(testValue));
        }

        [Test]
        public void SizeIsInitializedCorrectly()
        {
            Assert.That(_testClass.Size, Is.EqualTo(_size));
        }

        [Test]
        public void CanSetAndGetSize()
        {
            var testValue = 366988317;
            _testClass.Size = testValue;
            Assert.That(_testClass.Size, Is.EqualTo(testValue));
        }

        [Test]
        public void BudgetIsInitializedCorrectly()
        {
            Assert.That(_testClass.Budget, Is.EqualTo(_budget));
        }

        [Test]
        public void CanSetAndGetBudget()
        {
            var testValue = 1292079618;
            _testClass.Budget = testValue;
            Assert.That(_testClass.Budget, Is.EqualTo(testValue));
        }
    }
}