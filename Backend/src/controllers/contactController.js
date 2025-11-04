import nodemailer from "nodemailer";

export const sendContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"SmartPark Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      subject: `[SmartPark Contact] ${subject}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};
