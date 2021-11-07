using uaTdServer.Hubs;
using System;
using NUnit.Framework;
using System.Threading.Tasks;

namespace uaTdServer.Tests.Hubs
{
    [TestFixture]
    public class GameHubTests
    {
        private GameHub _testClass;

        [SetUp]
        public void SetUp()
        {
            _testClass = new GameHub();
        }

        [Test]
        public void CanConstruct()
        {
            var instance = new GameHub();
            Assert.That(instance, Is.Not.Null);
        }

        [Test]
        public async Task CanCallClientMessage()
        {
            var jsonData = "TestValue1921006190";
            await _testClass.ClientMessage(jsonData);
            Assert.Fail("Create or modify test");
        }

        [TestCase(null)]
        [TestCase("")]
        [TestCase("   ")]
        public void CannotCallClientMessageWithInvalidJsonData(string value)
        {
            Assert.ThrowsAsync<ArgumentNullException>(() => _testClass.ClientMessage(value));
        }
    }
}