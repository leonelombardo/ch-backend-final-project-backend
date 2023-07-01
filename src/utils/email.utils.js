const nodemailer = require("nodemailer");
const { EMAIL_SERVICE, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = require("../config/email.config");

const transport = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    port: EMAIL_PORT,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
})

const sendEmail = async (to, subject, message) => {
    const html = `
        <p style="font-size: 14px; font-family: sans-serif;">
            ${message}
        </p>
    `

    const options = {
        from: `test@noreply.com <leonelombardotest@gmail.com>`,
        to,
        subject,
        html
    }

    return await transport.sendMail(options);
}

module.exports = sendEmail;