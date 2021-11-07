using uaTdServer.Class;
using System;
using NUnit.Framework;

namespace uaTdServer.Tests.Class
{
    [TestFixture]
    public class BacteriaTests
    {
        private Bacteria _testClass;
        private double _health;
        private int _t;
        private double[] _vec;
        private int _type;

        [SetUp]
        public void SetUp()
        {
            _health = 496425763.35;
            _t = 62292144;
            _vec = new[] { 948007841.22, 230460410.07, 1947162826.62 };
            _type = 727356112;
            _testClass = new Bacteria(_health, _t, _vec, _type);
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new Bacteria(_health, _t, _vec, _type);
            Assert.That(instance, Is.Not.Null);
        }

        [Test]
        public void CannotConstructWithNullVec()
        {
            Assert.Throws<ArgumentNullException>(() => new Bacteria(291562981.38, 157291782, default(double[]), 1362588907));
        }

        [Test]
        public void CanCallregisterHit()
        {
            var hitNo = 540452799;
            var damage = 799618399.47;
            var result = _testClass.registerHit(hitNo, damage);
            Assert.Fail("Create or modify test");
        }

        [Test]
        public void CanSetAndGetid()
        {
            var testValue = 346487968L;
            _testClass.id = testValue;
            Assert.That(_testClass.id, Is.EqualTo(testValue));
        }

        [Test]
        public void healthIsInitializedCorrectly()
        {
            Assert.That(_testClass.health, Is.EqualTo(_health));
        }

        [Test]
        public void CanSetAndGethealth()
        {
            var testValue = 200283009.3;
            _testClass.health = testValue;
            Assert.That(_testClass.health, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGethitCount()
        {
            var testValue = 476893152;
            _testClass.hitCount = testValue;
            Assert.That(_testClass.hitCount, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetisDead()
        {
            var testValue = false;
            _testClass.isDead = testValue;
            Assert.That(_testClass.isDead, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetfollower()
        {
            var testValue = new BacteriaFollower { t = 706346110, vec = new Vector2 { x = 1551498424.74, y = 378777571.92 } };
            _testClass.follower = testValue;
            Assert.That(_testClass.follower, Is.EqualTo(testValue));
        }

        [Test]
        public void typeIsInitializedCorrectly()
        {
            Assert.That(_testClass.type, Is.EqualTo(_type));
        }

        [Test]
        public void CanSetAndGettype()
        {
            var testValue = 1460921349;
            _testClass.type = testValue;
            Assert.That(_testClass.type, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetspawnTime()
        {
            var testValue = 989795532L;
            _testClass.spawnTime = testValue;
            Assert.That(_testClass.spawnTime, Is.EqualTo(testValue));
        }
    }

    [TestFixture]
    public static class CounterTests
    {
        [Test]
        public static void CanCallgetId()
        {
            var result = Counter.getId();
            Assert.Fail("Create or modify test");
        }
    }

    [TestFixture]
    public class Vector2Tests
    {
        private Vector2 _testClass;

        [SetUp]
        public void SetUp()
        {
            _testClass = new Vector2();
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new Vector2();
            Assert.That(instance, Is.Not.Null);
        }

        [Test]
        public void CanSetAndGetx()
        {
            var testValue = 329279337.09;
            _testClass.x = testValue;
            Assert.That(_testClass.x, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGety()
        {
            var testValue = 1316167964.1;
            _testClass.y = testValue;
            Assert.That(_testClass.y, Is.EqualTo(testValue));
        }
    }

    [TestFixture]
    public class BacteriaFollowerTests
    {
        private BacteriaFollower _testClass;

        [SetUp]
        public void SetUp()
        {
            _testClass = new BacteriaFollower();
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new BacteriaFollower();
            Assert.That(instance, Is.Not.Null);
        }

        [Test]
        public void CanSetAndGett()
        {
            var testValue = 1662063419;
            _testClass.t = testValue;
            Assert.That(_testClass.t, Is.EqualTo(testValue));
        }

        [Test]
        public void CanSetAndGetvec()
        {
            var testValue = new Vector2 { x = 931330284.39, y = 1311375572.1 };
            _testClass.vec = testValue;
            Assert.That(_testClass.vec, Is.EqualTo(testValue));
        }
    }
}