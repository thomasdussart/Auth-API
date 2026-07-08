const fileConfig = require('config.json');

// Configuration centralisée : les secrets viennent des variables d'environnement
// en priorité, config.json ne sert que de solution de repli pour le développement.
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not set — falling back to the secret in config.json. Set JWT_SECRET in production.');
}

module.exports = {
    connectionString: process.env.MONGODB_URI || fileConfig.connectionString,
    secret: process.env.JWT_SECRET || fileConfig.secret,
    emailFrom: process.env.EMAIL_FROM || fileConfig.emailFrom,
    smtpOptions: {
        ...fileConfig.smtpOptions,
        auth: {
            user: process.env.SMTP_USER || fileConfig.smtpOptions.auth.user,
            pass: process.env.SMTP_PASS || fileConfig.smtpOptions.auth.pass,
        },
    },
    // Liste d'origines autorisées pour CORS, séparées par des virgules.
    // Vide = toutes les origines acceptées (comportement historique, dev uniquement).
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
};
