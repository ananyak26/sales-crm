import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { to, quoteNumber, accountName, total, shareUrl } = await request.json();

    if (!to || !shareUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: "Email is not configured yet. Add SENDGRID_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    if (!process.env.SEND_FROM_EMAIL) {
      return NextResponse.json(
        {
          error:
            "Add SEND_FROM_EMAIL to your environment variables — it must be the email address you verified as a Single Sender in SendGrid.",
        },
        { status: 500 }
      );
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>Quotation ${quoteNumber}</h2>
        <p>Please find your quotation${accountName ? " for " + accountName : ""} below.</p>
        <p><strong>Total: ₹${Number(total).toLocaleString("en-IN")}</strong></p>
        <p><a href="${shareUrl}" style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">View Quotation</a></p>
        <p style="color:#888;font-size:12px;">Or copy this link: ${shareUrl}</p>
      </div>
    `;

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.SEND_FROM_EMAIL },
        subject: `Quotation ${quoteNumber}${accountName ? " for " + accountName : ""}`,
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message =
        body?.errors?.map((e: any) => e.message).join("; ") || `SendGrid request failed (${res.status})`;
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
