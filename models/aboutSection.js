const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const aboutSectionSchema = new Schema({
    subRedditId: {
        type: String,
        ref: "subReddit",
        required: true
    }, 
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    links: {
        type: String,
        required: true
    },
});
module.exports = mongoose.model('aboutSection', aboutSectionSchema);