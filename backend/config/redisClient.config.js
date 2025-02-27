const axios = require("axios");
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
const loadRandomUsernamesToCache = async () => {
  console.log("Fetching new usernames to cache");

  const tempKey = "randomUsernamesNew";

  try {
    for (let i = 0; i < 150; i++) {
      try {
        const response = await axios.get(
          "https://usernameapiv1.vercel.app/api/random-usernames"
        );
        const newUsername = response.data.usernames[0];
        await redisClient.sAdd(tempKey, newUsername);
      } catch (error) {
        console.error("Error fetching random username:", error);
      }
    }

    // Atomic Swap: Swapping the old cache with the new one
    await redisClient.multi().rename(tempKey, "randomUsernames").exec();

    console.log("Random Usernames cache updated successfully");
  } catch (error) {
    console.error("Cache update failed:", error);
    await redisClient.del(tempKey); // Cleanup on failure
  }
};
const loadRandomPfpsToCache = async () => {
  console.log("Fetching new pfps to cache");

  const tempKey = "randomPfpsNew";
  let response;
  try {
    // Fill temporary set
    for (let i = 0; i < 2; i++) {
      try {
        if (i < 1) {
          response = await axios.get(
            `https://api.nekosapi.com/v4/images/random?rating=safe&limit=100`
          );
        } else {
          response = await axios.get(
            `https://api.nekosapi.com/v4/images/random?rating=suggestive&limit=50`
          );
        }
        for (let file of response.data) {
          const newUrl = file.url;
          await redisClient.sAdd(tempKey, newUrl);
        }
      } catch (error) {
        console.error(`Error fetching pfp at index ${i}:`, error.message);
        if (error.response?.status === 500 || error.response?.status === 404) {
          i--; // Retry same index
          continue;
        }
      }
    }

    // Atomic swap after all pfps are loaded
    await redisClient.multi().rename(tempKey, "randomPfps").exec();

    console.log("Random Pfps cached in Redis");
  } catch (error) {
    console.error("Cache update failed:", error);
    await redisClient.del(tempKey); // Cleanup on failure
  }
};

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.log("Redis error:", err);
});

module.exports = {
  redisClient,
  loadAllowedDomainsToCache,
  loadRandomUsernamesToCache,
  loadRandomPfpsToCache,
};
