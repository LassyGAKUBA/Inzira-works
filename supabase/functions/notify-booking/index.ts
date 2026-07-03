import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY          = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL            = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const APP_URL                 = "https://inzira-works.vercel.app";
// Use a verified domain email in production. Until then onboarding@resend.dev
// only delivers to your own Resend-registered address (good enough for testing).
const FROM_EMAIL              = Deno.env.get("FROM_EMAIL") ?? "onboarding@resend.dev";

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const booking = payload.record;
    if (!booking) return new Response("no record", { status: 200 });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const [{ data: provider }, { data: customer }] = await Promise.all([
      admin.from("users").select("full_name, email").eq("id", booking.provider_id).single(),
      admin.from("users").select("full_name, phone").eq("id", booking.customer_id).single(),
    ]);

    if (!provider?.email) return new Response("no provider email", { status: 200 });

    const date = booking.scheduled_date
      ? new Date(booking.scheduled_date).toLocaleDateString("en-US", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        })
      : "Not specified";

    const provFirst = (provider.full_name || "Provider").split(" ")[0];
    const custName  = customer?.full_name || "A customer";
    const custPhone = customer?.phone ?? null;

    const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9f7f3;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:520px;margin:32px auto;padding:0 16px;">
    <div style="background:white;border-radius:16px;padding:36px;border:1px solid #e8e2d8;">

      <p style="margin:0 0 20px;font-size:1rem;font-weight:700;color:#0E5C46;">Inzira Works</p>

      <h1 style="margin:0 0 8px;font-size:1.35rem;color:#172420;font-weight:700;">
        Hi ${provFirst}, you have a new booking!
      </h1>
      <p style="margin:0 0 24px;font-size:0.9rem;color:#5c7068;">
        ${custName} has sent you a service request. Log in to accept or decline.
      </p>

      <div style="background:#f9f7f3;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#5c7068;font-size:0.78rem;padding:5px 0;width:100px;vertical-align:top;">Service</td>
            <td style="color:#172420;font-size:0.85rem;font-weight:600;vertical-align:top;">${booking.title ?? "—"}</td>
          </tr>
          <tr>
            <td style="color:#5c7068;font-size:0.78rem;padding:5px 0;vertical-align:top;">Customer</td>
            <td style="color:#172420;font-size:0.85rem;font-weight:600;vertical-align:top;">${custName}</td>
          </tr>
          <tr>
            <td style="color:#5c7068;font-size:0.78rem;padding:5px 0;vertical-align:top;">Date</td>
            <td style="color:#172420;font-size:0.85rem;font-weight:600;vertical-align:top;">${date}</td>
          </tr>
          ${custPhone ? `
          <tr>
            <td style="color:#5c7068;font-size:0.78rem;padding:5px 0;vertical-align:top;">Phone</td>
            <td style="color:#172420;font-size:0.85rem;vertical-align:top;">${custPhone}</td>
          </tr>` : ""}
          ${booking.notes ? `
          <tr>
            <td style="color:#5c7068;font-size:0.78rem;padding:5px 0;vertical-align:top;">Notes</td>
            <td style="color:#172420;font-size:0.85rem;vertical-align:top;">${booking.notes}</td>
          </tr>` : ""}
        </table>
      </div>

      <a href="${APP_URL}/provider/dashboard"
        style="display:inline-block;background:#0E5C46;color:white;text-decoration:none;border-radius:10px;padding:12px 28px;font-weight:600;font-size:0.9rem;">
        View &amp; respond →
      </a>

      <p style="margin:24px 0 0;font-size:0.75rem;color:#9aab9e;">
        You received this because you are a provider on Inzira Works.
      </p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [provider.email],
        subject: `New booking request: ${booking.title ?? "Service"} — Inzira Works`,
        html,
      }),
    });

    const body = await res.json();
    return new Response(JSON.stringify(body), {
      status: res.ok ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-booking error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
