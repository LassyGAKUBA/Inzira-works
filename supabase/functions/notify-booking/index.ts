// @ts-nocheck — Deno URL imports are not resolvable by the Node/TS LSP; no runtime effect.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY            = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL              = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const APP_URL                   = "https://inzira-works.vercel.app";
const FROM_EMAIL                = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  return res;
}

function formatDate(iso: string | null) {
  if (!iso) return "Not specified";
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function emailShell(body: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9f7f3;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:520px;margin:32px auto;padding:0 16px;">
    <div style="background:white;border-radius:16px;padding:36px;border:1px solid #e8e2d8;">
      <p style="margin:0 0 20px;font-size:1rem;font-weight:700;color:#0E5C46;">Inzira Works</p>
      ${body}
      <p style="margin:24px 0 0;font-size:0.75rem;color:#9aab9e;">You received this because you have an account on Inzira Works.</p>
    </div>
  </div></body></html>`;
}

function detailTable(rows: [string, string][]) {
  return `<div style="background:#f9f7f3;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
    <table style="width:100%;border-collapse:collapse;">${rows.map(([label, value]) => `
      <tr>
        <td style="color:#5c7068;font-size:0.78rem;padding:5px 0;width:100px;vertical-align:top;">${label}</td>
        <td style="color:#172420;font-size:0.85rem;font-weight:600;vertical-align:top;">${value}</td>
      </tr>`).join("")}
    </table>
  </div>`;
}

function ctaButton(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#0E5C46;color:white;text-decoration:none;border-radius:10px;padding:12px 28px;font-weight:600;font-size:0.9rem;">${label} →</a>`;
}

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const booking = payload.record;
    const oldBooking = payload.old_record;
    const eventType: string = payload.type ?? "INSERT";

    if (!booking) return new Response("no record", { status: 200 });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const [{ data: provider }, { data: customer }] = await Promise.all([
      admin.from("users").select("full_name, email").eq("id", booking.provider_id).single(),
      admin.from("users").select("full_name, email, phone").eq("id", booking.customer_id).single(),
    ]);

    const date       = formatDate(booking.scheduled_date);
    const provFirst  = (provider?.full_name  || "Provider").split(" ")[0];
    const custFirst  = (customer?.full_name  || "Customer").split(" ")[0];
    const provName   = provider?.full_name  || "Your provider";
    const custName   = customer?.full_name  || "A customer";
    const custPhone  = (customer as any)?.phone ?? null;

    // ── New booking: notify provider ──────────────────────────────────────────
    if (eventType === "INSERT") {
      if (!provider?.email) return new Response("no provider email", { status: 200 });
      const rows: [string, string][] = [
        ["Service", booking.title ?? "—"],
        ["Customer", custName],
        ["Date", date],
        ...(custPhone ? [["Phone", custPhone] as [string, string]] : []),
        ...(booking.notes ? [["Notes", booking.notes] as [string, string]] : []),
      ];
      const html = emailShell(`
        <h1 style="margin:0 0 8px;font-size:1.35rem;color:#172420;font-weight:700;">Hi ${provFirst}, you have a new booking!</h1>
        <p style="margin:0 0 24px;font-size:0.9rem;color:#5c7068;">${custName} has sent you a service request. Log in to accept or decline.</p>
        ${detailTable(rows)}
        ${ctaButton("View &amp; respond", `${APP_URL}/provider/dashboard`)}`);
      console.log("Notifying provider:", provider.email);
      const res = await sendEmail(provider.email, `New booking request: ${booking.title ?? "Service"} — Inzira Works`, html);
      const body = await res.json();
      return new Response(JSON.stringify(body), { status: res.ok ? 200 : 500, headers: { "Content-Type": "application/json" } });
    }

    // ── Status change: notify customer ────────────────────────────────────────
    if (eventType === "UPDATE") {
      const newStatus  = booking.status;
      const prevStatus = oldBooking?.status;
      if (newStatus === prevStatus) return new Response("status unchanged", { status: 200 });
      if (!customer?.email) return new Response("no customer email", { status: 200 });

      let subject = "";
      let bodyHtml = "";

      if (newStatus === "confirmed") {
        subject = `Your booking was confirmed — Inzira Works`;
        bodyHtml = `
          <h1 style="margin:0 0 8px;font-size:1.35rem;color:#172420;font-weight:700;">Great news, ${custFirst}!</h1>
          <p style="margin:0 0 24px;font-size:0.9rem;color:#5c7068;">${provName} has accepted your booking request.</p>
          ${detailTable([["Service", booking.title ?? "—"], ["Provider", provName], ["Date", date]])}
          ${ctaButton("View booking", `${APP_URL}/customer/dashboard`)}`;
      } else if (newStatus === "rejected") {
        subject = `Your booking request was declined — Inzira Works`;
        bodyHtml = `
          <h1 style="margin:0 0 8px;font-size:1.35rem;color:#172420;font-weight:700;">Booking update, ${custFirst}</h1>
          <p style="margin:0 0 24px;font-size:0.9rem;color:#5c7068;">Unfortunately, ${provName} is unable to take your booking at this time. You can browse other providers and send a new request.</p>
          ${detailTable([["Service", booking.title ?? "—"], ["Date", date]])}
          ${ctaButton("Find another provider", `${APP_URL}/providers`)}`;
      } else if (newStatus === "completed") {
        subject = `Your service is complete — leave a review — Inzira Works`;
        bodyHtml = `
          <h1 style="margin:0 0 8px;font-size:1.35rem;color:#172420;font-weight:700;">Service completed, ${custFirst}!</h1>
          <p style="margin:0 0 24px;font-size:0.9rem;color:#5c7068;">${provName} has marked your service as completed. Your review helps other customers and supports providers on the platform.</p>
          ${detailTable([["Service", booking.title ?? "—"], ["Provider", provName], ["Date", date]])}
          ${ctaButton("Leave a review", `${APP_URL}/customer/dashboard`)}`;
      } else {
        return new Response("no email for this status", { status: 200 });
      }

      console.log("Notifying customer:", customer.email, "— status:", newStatus);
      const res = await sendEmail(customer.email, subject, emailShell(bodyHtml));
      const body = await res.json();
      return new Response(JSON.stringify(body), { status: res.ok ? 200 : 500, headers: { "Content-Type": "application/json" } });
    }

    return new Response("unhandled event type", { status: 200 });
  } catch (err) {
    console.error("notify-booking error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
