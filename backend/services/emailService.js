const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendConfirmationEmail(user) {
    try {
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const confirmationLink = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Confirme seu e-mail - Comunidades Ativas',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bem-vindo(a) ao Comunidades Ativas!</h2>
            <p>Obrigado por se cadastrar. Por favor, confirme seu endereço de e-mail clicando no botão abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationLink}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Confirmar E-mail
              </a>
            </div>
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all;">${confirmationLink}</p>
            <p>Este link expirará em 24 horas.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`E-mail de confirmação enviado para ${user.email}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao enviar e-mail de confirmação: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new EmailService();
