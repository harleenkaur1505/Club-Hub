const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
  // Create a transporter using environment variables or defaults
  // For development without specific env vars, this might need an Ethereal account,
  // but we'll set it up to attempt a connection or fail gracefully/log.

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,     // User's email
      pass: process.env.SMTP_PASSWORD   // User's app password
    }
  })

  // If no env vars are set, we might want to just log the email in dev mode
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('--- EMAIL SIMULATION (Set SMTP_EMAIL and SMTP_PASSWORD to send real emails) ---')
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log(`Message: ${options.text}`)
    console.log('--- END SIMULATION ---')
    return
  }

  const message = {
    from: `${process.env.FROM_NAME || 'Club Support'} <${process.env.SMTP_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    // html: options.html // Optional: if we want to send HTML emails later
  }

  const info = await transporter.sendMail(message)

  console.log('Message sent: %s', info.messageId)
}

module.exports = sendEmail
