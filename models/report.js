const moon = require('mongoose');
const Schema = moon.Schema;

const reportSchema = new Schema({
    reportId: {
        type: Number,
        required: true
    },
    referenceType: {
        type: String,
        enum: ['user', 'post', 'comment'],
        required: true
    },
    referenceId: {
        type: Number,
        required: true
    },
    viewerId: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isReviewed: {
        type: Number,
        required: true
    }
});

module.exports = moon.model('report', reportSchema);
