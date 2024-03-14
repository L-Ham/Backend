const crypto = require('crypto');
const randomString = crypto.randomBytes(32).toString('hex');
console.log(randomString);
