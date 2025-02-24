const userModel = require("../models/user.model");
const reportModel = require("../models/report.model");
const { default: mongoose } = require("mongoose");

module.exports.blacklistUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findOne({ _id: userId });
    user.isBlacklisted = true;
    await user.save();

    res.status(200).json({
      message: "Blacklisted the user successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.unblacklistUser = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBlacklisted = false;
    await user.save();
    res.status(200).json({
      message: "User has been unblacklisted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getReports = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    if (page <= 0) {
      return res.status(400).json({ message: "Invalid page number" });
    }
    const limit = 4; // Fetch 5 groups at a time
    const skip = (page - 1) * limit;

    // Count the total number of unique posts
    const totalReports = await reportModel.aggregate([
      {
        $group: {
          _id: "$post",
        },
      },
      {
        $count: "total",
      },
    ]);

    const total = totalReports.length > 0 ? totalReports[0].total : 0;

    // Fetch the reports with pagination and sorting
    const reports = await reportModel.aggregate([
      {
        $group: {
          _id: "$post",
          reportsByCategory: {
            $push: {
              category: "$category",
              report: "$$ROOT",
            },
          },
          latestReportDate: { $max: "$createdAt" },
        },
      },
      {
        $sort: {
          latestReportDate: -1, // Sort by the latest report date in descending order
        },
      },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "_id",
          as: "postDetails",
        },
      },
      {
        $unwind: "$reportsByCategory",
      },
      {
        $group: {
          _id: {
            post: "$_id",
            category: "$reportsByCategory.category",
          },
          reports: { $addToSet: "$reportsByCategory.report" },
          postDetails: { $first: "$postDetails" },
        },
      },
      {
        $group: {
          _id: "$_id.post",
          categories: {
            $push: {
              category: "$_id.category",
              reports: "$reports",
            },
          },
          postDetails: { $first: "$postDetails" },
        },
      },
    ]);

    res.status(200).json({ reports, reportCount: total });
  } catch (error) {
    next(error);
  }
};

module.exports.getBlacklistedUsers = async (req, res, next) => {
  try {
    const blacklistedUsers = await userModel
      .find({ isBlacklisted: true })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(30); // Limit the results to 30

    res.status(200).json({ blacklistedUsers });
  } catch (error) {
    next(error);
  }
};

module.exports.searchUser = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Build query conditions. If q is a valid ObjectId, search on _id.
    const conditions = [];
    if (mongoose.Types.ObjectId.isValid(q)) {
      conditions.push({ _id: q });
    }
    // Also search by email (case-insensitive)
    conditions.push({ email: { $regex: q, $options: "i" } });

    const user = await userModel.findOne({ $or: conditions });
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
