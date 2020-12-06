const nodemailer = require('nodemailer');
module.exports = {
    sendTemplateEmail: function (templateConfig) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${'application.automail@gmail.com'}`,
                pass: `${'auto@1234'}`,
            },
        });
        const mailOptions = {
            from: templateConfig.from,
            to: `${templateConfig.to}`,
            subject: templateConfig.subject,
            text:templateConfig.text
        };
        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('there was an error: ', err);
            } else {
                console.log('here is the res: ', response);
                // res.status(200).json('recovery email sent');
            }
        });
    }
}