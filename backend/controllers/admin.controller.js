const userModel = require("../models/user.model");

module.exports.blacklistUser = async(req, res, next) => {
    try {
        const {userId} = req.body;
        const user = await userModel.findOne({_id:userId});
        user.isBlacklisted = true;
        await user.save();

        res.send(200).json({
            message: "Blacklisted the user successfully.",
            user
        })
    } catch (error) {
        next(error);
    }
}

module.exports.getReports = async (req, res, next) => {
    try {
        const reports = await reportModel.aggregate([
            {
                $group: {
                    _id: "$post",
                    reports: { $addToSet: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "_id",
                    as: "postDetails"
                }
            }
        ]);

        res.status(200).json({ reports });
    } catch (error) {
        next(error);
    }
}