const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
  },
  universityName: {
    type: String,
    required: true,
    unique: true,
  },
  universityCategories: [
    {
      type: String,
    },
  ],
});

const Domain = mongoose.model("Domain", domainSchema);

module.exports = Domain;
