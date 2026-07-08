const config = require('_helpers/config');
const mongoose = require('mongoose');

mongoose.connect(config.connectionString)
    .catch(err => {
        console.error('MongoDB connection error: ' + err.message);
        process.exit(1);
    });

module.exports = {
    Account: require('accounts/account.model'),
    RefreshToken: require('accounts/refresh-token.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}
