const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const adminSchema = new Schema({
    admin_Id: {
        type: Number,
        required: true,
        unique: true,
        primary: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("admin", adminSchema);
