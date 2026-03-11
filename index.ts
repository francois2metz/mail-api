import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
import type { Request, Response } from "express";
dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.ORIGIN.split(' '),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

// Use multer to handle form data
const upload = multer();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_PROVIDER,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post('/send', upload.none(), async (req: Request, res: Response) => {
  let messageList = [];
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === 'string' && value !== "") {
      messageList.push(`${key}: ${value}`);
    }
  }
  let niceMessage = messageList.join('\n\n');
  console.log("message: ", niceMessage);

  async function sendMail() {
    const mailMessage = {
      from: process.env.EMAIL_FROM,
      to: [process.env.EMAIL_TO!],
      subject: 'Nouvelle demande',
      text: `${niceMessage}`,
    };
    transporter.sendMail(mailMessage, (error: any) => {
      console.log(error)
      if (error) {
        res.status(500).json('Error sending email');
      } else {
        res.json('Email sent successfully');
      }
    });
  }

  await sendMail();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
