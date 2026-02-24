import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  runtime: "edge",
};

/**
 * Escapes characters that are unsafe for HTML.
 * Used to sanitize user input before embedding it into the email HTML.
 * @param {string} str - The raw string to escape.
 * @returns {string} The escaped string safe for HTML rendering.
 */
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, function (s) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[s];
  });
}

export async function POST({ request }) {
  try {
    const {
      "your-name": name,
      "your-email": email,
      "your-message": message,
      honeypot,
      mathChallenge,
    } = await request.json();

    // 1. Honeypot check
    if (honeypot && honeypot.trim() !== "") {
      // Return 200 so bots think it succeeded, but drop the email.
      return new Response(JSON.stringify({ message: "Message sent successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Math Challenge check
    const mathAnswer = parseInt(mathChallenge, 10);
    if (isNaN(mathAnswer) || mathAnswer !== 7) {
      return new Response(
        JSON.stringify({ message: "Bot detection: Incorrect security question answer." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. URL Pattern checking in name
    const urlRegex = /(http:\/\/|https:\/\/|www\.)/i;
    if (urlRegex.test(name)) {
      return new Response(
        JSON.stringify({ message: "Bot detection: Invalid characters in name." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
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

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .header { background: #4f46e5; color: #fff; padding: 18px; text-align: center; }
    .content { padding: 18px; }
    .label { font-weight: 600; color: #4f46e5; }
  </style>
</head>
<body>
  <div class="header"><h1>New Contact Message</h1></div>
  <div class="content">
    <p><span class="label">Name:</span> ${escapeHtml(name)}</p>
    <p><span class="label">Email:</span> ${escapeHtml(email)}</p>
    <p><span class="label">Message:</span> ${escapeHtml(message)}</p>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: process.env.FROM_EMAIL || "no-reply@onresend.com",
      to: process.env.TO_EMAIL || "info@puravidaexpediciones.com",
      subject: `Contacto Website de ${name}`,
      html,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
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
