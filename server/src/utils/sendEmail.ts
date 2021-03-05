import nodemailer from 'nodemailer';

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  // let testAccount = await nodemailer.createTestAccount();
  // console.log(testAccount);

  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'iycqnfn3zpvimhzn@ethereal.email',
      pass: 'c1aHndf4WtEjjbFTZB',
    },
  });

  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to,
    subject,
    html,
  });

  console.log('Message sent: %s', info.messageId);

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
