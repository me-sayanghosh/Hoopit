import nodemailer from 'nodemailer';

const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
};

export const isEmailConfigured = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
};

export const sendPasswordResetCode = async (email, code) => {
    const transporter = createTransporter();
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'Hoopit <no-reply@hoopit.local>';

    if (!transporter) {
        console.log(`Password reset code for ${email}: ${code}`);
        return false;
    }

    await transporter.sendMail({
        from,
        to: email,
        subject: 'Your Hoopit password reset code',
        text: `Your Hoopit password reset code is ${code}. It expires in 10 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
                <h2 style="margin: 0 0 12px;">Reset your Hoopit password</h2>
                <p>Use this verification code to reset your password:</p>
                <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${code}</p>
                <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
            </div>
        `,
    });

    return true;
};
