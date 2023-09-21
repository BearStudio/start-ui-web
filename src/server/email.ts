import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';

const transport = nodemailer.createTransport(process.env.EMAIL_SERVER);

export const sendEmail = (options: MailOptions) =>
  transport.sendMail({
    from: process.env.EMAIL_FROM,
    ...options,
  });
