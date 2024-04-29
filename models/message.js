const mongoose = require("mongoose");
const { boolean } = require("webidl-conversions");

const Schema = mongoose.Schema;
const messageSchema = new Schema({
   
});

module.exports = mongoose.model("message", messageSchema);
