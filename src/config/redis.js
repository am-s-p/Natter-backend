const { createClient } = require("redis");

const pubClient = createClient({
  url: process.env.REDIS_URL,
});

const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.error("Redis Pub Error:", err));
subClient.on("error", (err) => console.error("Redis Sub Error:", err));

(async () => {
  await pubClient.connect();
  await subClient.connect();
})();

module.exports = { pubClient, subClient };