import Twilio from 'twilio';

const twilio = Twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function sendText(body: string, to: string = process.env.LAURA_PHONE_NUMBER!) {
    const message = await twilio.messages.create({
        body,
        to,
        from: process.env.TWILIO_PHONE_NUMBER!,
    });

    message.status === "accepted" ? console.log("Text message sent.") : console.error("Error sending text message.");
}