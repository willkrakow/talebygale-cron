import Twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config({
    path: ".env"
});

const twilio = Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function sendText(body: string, to: string = process.env.LAURA_PHONE_NUMBER!) {
    const message = await twilio.messages.create({
        body,
        to,
        from: process.env.TWILIO_PHONE_NUMBER!,
    });

    console.log(`Text message ${message.status}`);
}