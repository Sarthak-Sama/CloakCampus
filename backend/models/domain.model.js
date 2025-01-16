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
  universityDescription: {
    type: String,
    required: true,
  },
  universityStudentCount: {
    type: Integer,
    required: true,
    default: 0,
  },
  universityPostsCount: {
    type: Integer,
    required: true,
    default: 0,
  },
});

const Domain = mongoose.model("Domain", domainSchema);

module.exports = Domain;
