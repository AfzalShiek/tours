// const nodemailer = require('nodemailer');
const nodemailer = require('nodemailer');
const { convert } = require('html-to-text');
const pug = require('pug');
const sgTransport = require('nodemailer-sendgrid-transport');

//new Email(user,url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `< ${process.env.EMAIL_FROM} >`;
  }

  
  newTransport() {
    if (process.env.NODE_ENV !== 'production') {
      // Development environment configuration
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      // Production environment configuration using SendGrid
      return nodemailer.createTransport(
        sgTransport({
          auth: {
            api_key: process.env.SENDGRID_PASSWORD,
          },
        })
      );
    }
  }
  //Send the actual email
  async send(template, subject) {
    //1)Render HTML based on a Pug Template

    // res.render('');
    // console.log(`${__dirname}/views/email/${template}.pug`);
    const html = pug.renderFile(`${__dirname}/views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //2)Define the EmailOptions
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // text:  convert(html, {
      //   wordwrap: 130 // Adjust the word wrap length as needed
      // })
      //html
    };

    //3)Create a transport and snd Email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!!!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password token (valid for only 10 minutes)'
    );
  }
};
