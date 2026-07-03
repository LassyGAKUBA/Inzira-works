import { Link } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import PageTransition from "../../components/shared/PageTransition";

const G    = "#0E5C46";
const DARK = "#172420";
const MUTED = "#5c7068";
const SERIF = "Spectral, serif";
const SANS  = "'Hanken Grotesk', sans-serif";
const CREAM = "#ede9e0";

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.25rem", fontWeight: 700, marginBottom: 12, letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      <div style={{ color: MUTED, fontSize: "0.9rem", lineHeight: 1.75 }}>
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <PageTransition>
      <div style={{ fontFamily: SANS, backgroundColor: CREAM, minHeight: "100vh" }}>
        <Navbar />

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px 80px" }}>
          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <Link to="/" style={{ color: G, fontSize: "0.82rem", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
              ← Back to home
            </Link>
            <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 12 }}>
              Privacy Policy
            </h1>
            <p style={{ color: MUTED, fontSize: "0.875rem" }}>
              Last updated: July 2025 &nbsp;·&nbsp; Effective for all users of Inzira Works
            </p>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: 18, border: "1px solid #e8e2d8", padding: "40px 44px" }}>

            <Section title="1. Who We Are">
              <p>
                Inzira Works ("we", "our", "the platform") is a digital marketplace connecting skilled women
                service providers in Kigali City with customers seeking professional services.
                We operate under the laws of Rwanda, including the Law No. 058/2021 on the Protection of
                Personal Data and Privacy in Rwanda.
              </p>
            </Section>

            <Section title="2. Data We Collect">
              <p style={{ marginBottom: 10 }}>We collect only what is necessary to provide our services:</p>
              <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                <li><strong>Identity data</strong> — full name, profile photo</li>
                <li><strong>Contact data</strong> — email address, phone number</li>
                <li><strong>Location data</strong> — district in Kigali you operate from or are located in</li>
                <li><strong>Profile data</strong> — headline, bio, service listings, portfolio images, specialties</li>
                <li><strong>Usage data</strong> — booking history, reviews you give or receive</li>
                <li><strong>Technical data</strong> — browser type, IP address, session tokens (via Supabase Auth)</li>
              </ul>
              <p style={{ marginTop: 12 }}>We do not collect payment card information. Payments are handled outside the platform.</p>
            </Section>

            <Section title="3. How We Use Your Data">
              <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                <li>To create and manage your account</li>
                <li>To match customers with service providers</li>
                <li>To send booking confirmations and notifications</li>
                <li>To calculate and display your Trust Score (providers only)</li>
                <li>To moderate content and maintain platform safety</li>
                <li>To send password reset emails when requested</li>
              </ul>
              <p style={{ marginTop: 12 }}>We do not sell your personal data to third parties.</p>
            </Section>

            <Section title="4. Data Sharing">
              <p style={{ marginBottom: 10 }}>We share data only where necessary:</p>
              <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                <li><strong>Supabase</strong> — our backend infrastructure provider, processing data under a data processing agreement</li>
                <li><strong>Vercel</strong> — our hosting provider for the frontend application</li>
                <li><strong>Other users</strong> — your public profile (name, headline, district, services, reviews) is visible to all platform visitors. Your email and phone are only shared with customers you have an accepted booking with.</li>
              </ul>
            </Section>

            <Section title="5. Your Rights Under Rwanda Data Protection Law">
              <p style={{ marginBottom: 10 }}>You have the right to:</p>
              <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
                <li><strong>Rectification</strong> — correct inaccurate data via your profile settings</li>
                <li><strong>Erasure</strong> — request deletion of your account and associated data</li>
                <li><strong>Objection</strong> — object to specific processing of your data</li>
                <li><strong>Portability</strong> — request your data in a portable format</li>
              </ul>
              <p style={{ marginTop: 12 }}>
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:privacy@inziraworks.rw" style={{ color: G, fontWeight: 600 }}>privacy@inziraworks.rw</a>.
                We will respond within 30 days.
              </p>
            </Section>

            <Section title="6. Data Retention">
              <p>
                We retain your personal data for as long as your account is active. If you delete your account,
                we will remove your personal data within 30 days, except where we are legally required to
                retain certain records (e.g., for dispute resolution).
              </p>
            </Section>

            <Section title="7. Cookies and Tracking">
              <p>
                We use only essential cookies required for authentication (session tokens). We do not use
                advertising trackers or analytics cookies that track you across other websites.
              </p>
            </Section>

            <Section title="8. Security">
              <p>
                All data is encrypted in transit (HTTPS/TLS). Passwords are never stored in plain text —
                they are hashed with bcrypt via Supabase Auth. Access to the database is restricted to
                authenticated users via row-level security policies.
              </p>
            </Section>

            <Section title="9. Changes to This Policy">
              <p>
                We may update this policy from time to time. When we do, we will update the "Last updated"
                date at the top of this page. Continued use of the platform after changes constitutes
                acceptance of the updated policy.
              </p>
            </Section>

            <Section title="10. Contact">
              <p>
                For any questions about this privacy policy or how we handle your data, contact us at{" "}
                <a href="mailto:privacy@inziraworks.rw" style={{ color: G, fontWeight: 600 }}>privacy@inziraworks.rw</a>.
              </p>
            </Section>

          </div>
        </div>

        {/* Footer */}
        <footer style={{ backgroundColor: "#e8e3d8", borderTop: "1px solid #d4cfc5", padding: "20px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: DARK, fontWeight: 600, fontSize: "0.875rem" }}>Inzira Works</span>
            <p style={{ color: MUTED, fontSize: "0.75rem" }}>© 2025 Inzira Works. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
