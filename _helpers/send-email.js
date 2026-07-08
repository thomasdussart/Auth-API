const nodemailer = require('nodemailer');
const config = require('_helpers/config');

// Transporter créé une seule fois et réutilisé (au lieu d'un par email)
const transporter = nodemailer.createTransport(config.smtpOptions);

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    await transporter.sendMail({ from, to, subject, html });
}
