import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to : to || "mh03212868@gmail.com",
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        message: error.message,
      };
    }

    console.log("Email sent:", data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Resend error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};
