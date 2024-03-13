const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const notificationSchema = new Schema({
    notificationId: {
        type: Number,
        required: true,
        unique: true
    },
    userId: {
        type: Number,
        ref: 'user',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    typeId: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },  
});
module.exports = mongoose.model('notification', notificationSchema);