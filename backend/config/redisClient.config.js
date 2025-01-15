const redis = require("redis");
const domainModel = require("../models/domain.model");
const redisClient = redis.createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Function to load allowed domains into Redis
const loadAllowedDomainsToCache = async () => {
  try {
    // Fetch allowed domains from MongoDB
    const domains = await domainModel.find().select("domain");

    // Store each domain in Redis
    const domainList = domains.map((d) => d.domain); // Extract the domains as an array

    // Store domains as a set in Redis (SADD ensures uniqueness)
    await redisClient.sAdd("allowed_domains", domainList);
    console.log("Allowed domains cached in Redis");
  } catch (error) {
    console.error("Error loading domains into Redis:", error);
  }
};

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.log("Redis error:", err);
});

module.exports = { redisClient, loadAllowedDomainsToCache };
