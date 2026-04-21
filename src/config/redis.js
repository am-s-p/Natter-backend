const { createClient } = require("redis");

const pubClient = createClient({
  url: process.env.REDIS_URL,
});

const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.error("Redis Pub Error:", err));
subClient.on("error", (err) => console.error("Redis Sub Error:", err));

(async () => {
  try {
    await pubClient.connect();
    console.log("Redis Pub Client Connected");
    await subClient.connect();
    console.log("Redis Sub Client Connected");
  } catch (err) {
    console.error("Redis Connection Failed:", err.message);
    console.warn("Continuing without Redis - Sockets may not work correctly.");
  }
})();

module.exports = { pubClient, subClient };