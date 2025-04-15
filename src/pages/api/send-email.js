import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  runtime: "edge",
};

export async function GET() {
  return new Response(JSON.stringify({ message: "Too high" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST({ request }) {
  try {
    const {
      "your-name": name,
      "your-email": email,
      "your-message": message,
      honeypot,
    } = await request.json();

    // Check honeypot field
    if (honeypot) {
      return new Response(JSON.stringify({ message: "Spam detected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await resend.emails.send({
      from: "no-reply@fieldsmarshall.com",
      to: "fields.marshall@gmail.com",
      subject: `New Contact Form Submission from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
    });

    return new Response(
      JSON.stringify({ message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
