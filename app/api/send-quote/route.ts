import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { to, quoteNumber, accountName, total, shareUrl } = await request.json();

    if (!to || !shareUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email is not configured yet. Add RESEND_API_KEY to your environment variables." },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: process.env.SEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject: `Quotation ${quoteNumber}${accountName ? " for " + accountName : ""}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px;">
          <h2>Quotation ${quoteNumber}</h2>
          <p>Please find your quotation${accountName ? " for " + accountName : ""} below.</p>
          <p><strong>Total: ₹${Number(total).toLocaleString("en-IN")}</strong></p>
          <p><a href="${shareUrl}" style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;">View Quotation</a></p>
          <p style="color:#888;font-size:12px;">Or copy this link: ${shareUrl}</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
