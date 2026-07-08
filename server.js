require('rootpath')();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('_helpers/config');
const errorHandler = require('_middleware/error-handler');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// CORS : restreint aux origines de ALLOWED_ORIGINS si défini ;
// sinon toutes les origines sont acceptées (dev uniquement)
app.use(cors({
    origin: config.allowedOrigins.length
        ? config.allowedOrigins
        : (origin, callback) => callback(null, true),
    credentials: true
}));

// api routes
app.use('/accounts', require('./accounts/accounts.controller'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 4000);
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});
