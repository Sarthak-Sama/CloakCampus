const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blackListSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
});

blackListSchema.index({token: 1}, {unique: true})

module.exports = mongoose.model('BlackList', blackListSchema);
