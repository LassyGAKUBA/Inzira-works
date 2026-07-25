import { Link } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import PageTransition from "../../components/shared/PageTransition";

const G     = "#0E5C46";
const DARK  = "#172420";
const MUTED = "#5c7068";
const GOLD  = "#b98a22";
const SERIF = "Spectral, serif";
const SANS  = "'Hanken Grotesk', sans-serif";
const CREAM = "#ede9e0";

const SECTIONS = [
  "Definitions",
  "Eligibility and Account Registration",
  "User Roles and Responsibilities",
  "Acceptable Use",
  "Prohibited Conduct",
  "Provider Verification",
  "Booking and Communication",
  "Reviews and Trust Score",
  "Intellectual Property Rights",
  "Privacy and Data Protection",
  "Account Suspension and Termination",
  "Limitation of Liability",
  "Dispute Resolution",
  "Governing Law",
  "Amendments",
  "Contact",
];

function Section({ num, title, children }) {
  const id = `s${num}`;
  return (
    <section id={id} style={{ marginBottom: 44, scrollMarginTop: 80 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: GOLD, letterSpacing: "0.06em", flexShrink: 0, minWidth: 26, fontVariantNumeric: "tabular-nums" }}>
          {String(num).padStart(2, "0")}
        </span>
        <h2 style={{ fontFamily: SERIF, color: DARK, fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.25 }}>
          {title}
        </h2>
      </div>
      <div style={{ paddingLeft: 38, color: DARK, fontSize: "0.875rem", lineHeight: 1.8 }}>
        {children}
      </div>
    </section>
  );
}

function RoleBlock({ label, items }) {
  return (
    <div style={{ backgroundColor: "white", border: "1px solid #d4cfc5", borderRadius: 10, padding: "16px 18px", marginBottom: 10 }}>
      <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: G, marginBottom: 8 }}>{label}</p>
      <ul style={{ paddingLeft: 18, color: DARK, fontSize: "0.86rem", lineHeight: 1.75 }}>
        {items.map((item, i) => <li key={i} style={{ marginBottom: i < items.length - 1 ? 5 : 0 }}>{item}</li>)}
      </ul>
    </div>
  );
}

function ProhibitedItem({ children }) {
  return (
    <li style={{ display: "flex", gap: 10, fontSize: "0.86rem", color: DARK, padding: "9px 0", borderBottom: "1px solid #e8e2d8", alignItems: "flex-start" }}>
      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#c94f4f", background: "#fde8e8", borderRadius: 99, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>✕</span>
      <span>{children}</span>
    </li>
  );
}

function Step({ n, children }) {
  return (
    <li style={{ display: "flex", gap: 14, fontSize: "0.86rem", color: DARK, padding: "10px 0", borderBottom: "1px solid #e8e2d8", alignItems: "flex-start" }}>
      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: G, background: "#e8f3ee", borderRadius: 99, width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{n}</span>
      <span>{children}</span>
    </li>
  );
}

export default function EulaPage() {
  return (
    <PageTransition>
      <div style={{ fontFamily: SANS, backgroundColor: CREAM, minHeight: "100vh" }}>
        <Navbar />

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px 80px" }}>

          {/* Back link */}
          <Link to="/" style={{ color: G, fontSize: "0.82rem", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
            ← Back to home
          </Link>

          {/* Page header */}
          <div style={{ borderBottom: "2px solid #d4cfc5", paddingBottom: 28, marginBottom: 36 }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>
              Inzira Works · Platform Agreement
            </p>
            <h1 style={{ fontFamily: SERIF, color: DARK, fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 12, textWrap: "balance" }}>
              End-User Licence Agreement
            </h1>
            <p style={{ color: MUTED, fontSize: "0.875rem", lineHeight: 1.65 }}>
              This agreement governs your access to and use of the Inzira Works web platform,
              a service marketplace connecting skilled women in Kigali City with customers.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 14, fontSize: "0.78rem", color: MUTED }}>
              <span>Effective Date: July 2026</span>
              <span>·</span>
              <span>Version 1.0</span>
              <span>·</span>
              <span>Kigali City, Rwanda</span>
            </div>
          </div>

          {/* Notice */}
          <div style={{ background: "#e8f3ee", border: "1px solid #0E5C46", borderLeft: "4px solid #0E5C46", borderRadius: 10, padding: "14px 18px", fontSize: "0.85rem", color: DARK, marginBottom: 36, lineHeight: 1.65 }}>
            <strong style={{ color: G }}>Please read this agreement carefully.</strong>{" "}
            By registering an account or using the Inzira Works platform, you confirm that you have read, understood, and agreed to be bound by this End-User Licence Agreement. If you do not agree, you must not access or use the platform.
          </div>

          {/* Table of contents */}
          <div style={{ backgroundColor: "white", border: "1px solid #d4cfc5", borderRadius: 10, padding: "20px 22px", marginBottom: 40 }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 12 }}>Contents</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {SECTIONS.map((title, i) => (
                <a key={i} href={`#s${i + 1}`}
                  style={{ color: G, textDecoration: "none", fontSize: "0.8rem", fontWeight: 500, display: "flex", alignItems: "baseline", gap: 7, padding: "3px 0" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: GOLD, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {title}
                </a>
              ))}
            </div>
          </div>

          {/* ── Sections ── */}

          <Section num={1} title="Definitions">
            <p>In this Agreement, the following terms have the meanings set out below:</p>
            <RoleBlock label="" items={[
              <><strong>"Platform"</strong> means the Inzira Works web application, accessible at inzira-works.vercel.app, including all associated services, features, and content.</>,
              <><strong>"Provider"</strong> means a skilled woman who registers on the Platform to offer vocational services such as tailoring, hairdressing, catering, or handcraft production.</>,
              <><strong>"Customer"</strong> means any individual who registers on the Platform to search for, view, or book the services of a Provider.</>,
              <><strong>"Administrator"</strong> means a person authorized by the Platform operator to manage user accounts, review Provider verifications, and moderate content.</>,
              <><strong>"Booking"</strong> means a service request submitted by a Customer to a Provider through the Platform.</>,
              <><strong>"Trust Score"</strong> means the automated reliability indicator (0–100) computed from a Provider's customer ratings, completed bookings, profile completeness, and response rate.</>,
              <><strong>"Portfolio"</strong> means images and descriptions of completed work uploaded by a Provider to demonstrate their skills and service quality.</>,
              <><strong>"We," "us," or "Platform Operator"</strong> means GAKUBA Lassy Orlene and the Inzira Works development team.</>,
              <><strong>"You" or "User"</strong> means any person accessing or using the Platform in any capacity.</>,
            ]} />
          </Section>

          <Section num={2} title="Eligibility and Account Registration">
            <p>You must be at least 18 years of age and legally capable of entering into a binding agreement to use this Platform. By registering, you represent that all information you provide is accurate, current, and complete.</p>
            <p style={{ marginTop: 10 }}>Each person may hold only one account. Creating multiple accounts to circumvent suspensions or to artificially inflate activity is prohibited. You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account.</p>
            <p style={{ marginTop: 10 }}>You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss arising from your failure to keep your credentials secure.</p>
          </Section>

          <Section num={3} title="User Roles and Responsibilities">
            <RoleBlock label="Customers" items={[
              "Search for Providers and submit Booking requests honestly and in good faith.",
              "Provide accurate contact details and a valid Rwandan telephone number to facilitate communication with Providers.",
              "Communicate professionally with Providers through WhatsApp and on-Platform messaging.",
              "Submit reviews only for services they have genuinely received through a completed Booking.",
              "Honour agreed appointments and provide reasonable notice of cancellation.",
              "Refrain from sharing Providers' personal contact details with third parties without consent.",
            ]} />
            <RoleBlock label="Service Providers" items={[
              "Maintain an accurate and up-to-date profile, including service descriptions, pricing, availability, and portfolio images.",
              "Respond to Booking requests promptly and professionally, accepting or declining within a reasonable time.",
              "Deliver services with the standard of quality and care represented in their profile and portfolio.",
              "Submit only genuine documents during the verification process and not misrepresent qualifications or experience.",
              "Not solicit Customers to leave positive reviews or offer incentives in exchange for reviews.",
              "Comply with all applicable Rwandan laws governing the provision of their services, including tax obligations.",
            ]} />
            <RoleBlock label="Administrators" items={[
              "Review Provider verification submissions fairly and consistently, applying the same standards to all applicants.",
              "Moderate reviews and content in accordance with the Platform's content policies without bias.",
              "Exercise suspension and deactivation powers only where there are reasonable grounds to do so under this Agreement.",
              "Maintain the confidentiality of user data accessed in the course of their administrative duties.",
              "Not use administrative access for personal benefit or to favour particular Providers or Customers.",
            ]} />
          </Section>

          <Section num={4} title="Acceptable Use">
            <p>You may use the Platform solely for its intended purpose: connecting skilled women with customers seeking vocational services in Kigali City. All use must comply with applicable Rwandan law and the terms of this Agreement.</p>
            <p style={{ marginTop: 10 }}>You agree to use the Platform in a manner that is respectful of other users, promotes fair commercial activity, and supports the Platform's mission of advancing the economic visibility of skilled women. Behaviour that undermines the trust or safety of the community is grounds for account action.</p>
            <p style={{ marginTop: 10 }}>You may not use the Platform for any commercial purpose other than the direct booking and provision of services as described, without the prior written consent of the Platform Operator.</p>
          </Section>

          <Section num={5} title="Prohibited Conduct">
            <p style={{ marginBottom: 12 }}>The following activities are strictly prohibited and may result in immediate account suspension:</p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <ProhibitedItem>Submitting fake, fabricated, or incentivized reviews, or reviewing a Provider you have not genuinely engaged through a completed Booking.</ProhibitedItem>
              <ProhibitedItem>Creating Bookings for the purpose of generating artificial transaction history or inflating a Trust Score without genuine service delivery.</ProhibitedItem>
              <ProhibitedItem>Impersonating another person, organization, or verified credential holder during registration or on your profile.</ProhibitedItem>
              <ProhibitedItem>Uploading false, misleading, or plagiarized portfolio images that do not represent your own completed work.</ProhibitedItem>
              <ProhibitedItem>Submitting false or altered identity documents, qualifications, or TVET certificates during verification.</ProhibitedItem>
              <ProhibitedItem>Harassing, threatening, or engaging in discriminatory conduct toward other users, including via WhatsApp communications initiated through the Platform.</ProhibitedItem>
              <ProhibitedItem>Attempting to bypass Row-Level Security, authentication, or any other access control through direct API calls, scripting, or other technical means.</ProhibitedItem>
              <ProhibitedItem>Scraping, harvesting, or systematically collecting user data from the Platform for any purpose.</ProhibitedItem>
              <ProhibitedItem>Using the Platform to advertise, solicit, or transact services outside its defined categories without authorization.</ProhibitedItem>
              <ProhibitedItem>Uploading content that is obscene, defamatory, illegal under Rwandan law, or infringes the intellectual property rights of any third party.</ProhibitedItem>
              <ProhibitedItem>Creating multiple accounts to circumvent a suspension or to misrepresent Platform activity levels.</ProhibitedItem>
              <ProhibitedItem>Interfering with the operation, integrity, or availability of the Platform or its underlying infrastructure.</ProhibitedItem>
            </ul>
          </Section>

          <Section num={6} title="Provider Verification">
            <p>Provider verification is administered by Platform Administrators to confirm a Provider's identity and professional credentials. Verification is voluntary but confers a "Verified" badge on the public profile and is available as a customer-facing filter in the directory.</p>
            <p style={{ marginTop: 10, marginBottom: 12 }}>The verification process proceeds as follows:</p>
            <ol style={{ listStyle: "none", padding: 0 }}>
              <Step n={1}>The Provider submits a copy of their Rwandan National Identity Card and, where applicable, a TVET certificate or other qualifying credential through the onboarding wizard.</Step>
              <Step n={2}>An Administrator reviews the submitted documents within a reasonable time and may request additional information if required.</Step>
              <Step n={3}>Upon approval, the Provider's account is marked as Verified. Upon rejection, the Provider is notified and may reapply after addressing the grounds for rejection.</Step>
              <Step n={4}>The Platform Operator reserves the right to revoke verification status at any time if it is discovered that fraudulent or altered documents were submitted.</Step>
            </ol>
            <p style={{ marginTop: 14 }}>Verification confirms identity and credentials only. It does not constitute an endorsement of service quality by the Platform Operator, nor does it create any employment or agency relationship between a Provider and the Platform Operator.</p>
          </Section>

          <Section num={7} title="Booking and Communication">
            <p>The Platform facilitates introductions between Customers and Providers. When a Customer submits a Booking request, the request is recorded in the Platform database and a pre-filled WhatsApp message is opened to the Provider's registered telephone number. Scheduling, service delivery, and payment are agreed directly between the Customer and Provider.</p>
            <p style={{ marginTop: 10 }}>The Platform Operator is not a party to any agreement between a Customer and a Provider and is not responsible for the quality of services delivered, payment disputes, or any harm arising from a service engagement. Providers set their own prices and terms of service.</p>
            <p style={{ marginTop: 10 }}>Because payments are made directly between users outside the Platform, the Platform Operator cannot verify, guarantee, or mediate payment disputes. Users are encouraged to agree on payment terms clearly before services are delivered.</p>
          </Section>

          <Section num={8} title="Reviews and Trust Score">
            <p>Customers may leave one review per completed Booking. This constraint is enforced at the database level. Reviews must reflect genuine personal experience of the service received. Reviews that are found to be fabricated, coerced, or in breach of Section 5 will be removed and the submitting account may be suspended.</p>
            <p style={{ marginTop: 10 }}>The Trust Score is computed automatically from four weighted factors: average customer rating (40%), completed bookings (30%), profile completeness (20%), and response rate (10%). It is updated in real time by the database whenever an underlying input changes.</p>
            <p style={{ marginTop: 10 }}>The Trust Score is an informational signal to assist Customers in comparing Providers. It is not a guarantee of service quality or outcome. Providers who believe their Trust Score is incorrectly computed may contact the Platform Operator with supporting evidence.</p>
            <p style={{ marginTop: 10 }}>Administrators may remove reviews that violate this Agreement, but may not remove negative reviews solely because they are unflattering to a Provider.</p>
          </Section>

          <Section num={9} title="Intellectual Property Rights">
            <p>The Platform, including its source code, design system, database structure, Trust Score algorithm, and all original written content, is the intellectual property of the Platform Operator and is protected under applicable intellectual property law.</p>
            <p style={{ marginTop: 10 }}>By uploading content to the Platform — including portfolio images, profile descriptions, and service listings — you grant the Platform Operator a non-exclusive, royalty-free, worldwide licence to store, display, and reproduce that content on the Platform for the purpose of operating the service. This licence terminates when you delete the content or close your account.</p>
            <p style={{ marginTop: 10 }}>You represent that you own or have the right to use all content you upload and that it does not infringe the intellectual property rights of any third party. Uploading images of another person's work and presenting them as your own constitutes fraud and will result in account termination.</p>
            <p style={{ marginTop: 10 }}>Nothing in this Agreement transfers ownership of your content to the Platform Operator. You retain all rights to your own work.</p>
          </Section>

          <Section num={10} title="Privacy and Data Protection">
            <p>The Platform collects and processes personal data including name, email address, telephone number, district, profile information, and booking history. This data is processed in accordance with <strong>Law No. 058/2021 of 13/10/2021 on the Protection of Personal Data and Privacy in Rwanda</strong>.</p>
            <p style={{ marginTop: 10 }}>Data is stored securely within Supabase's managed infrastructure. Row-Level Security policies ensure that users can only access data they are authorized to view. Passwords are never stored in plaintext; authentication is managed through Supabase Auth using JSON Web Tokens.</p>
            <p style={{ marginTop: 10 }}>You have the right to access, correct, and delete your personal data. Account deletion can be initiated at any time from your profile settings and erases your profile, services, portfolio, bookings, and reviews. This right exists in accordance with Article 20 of Law No. 058/2021.</p>
            <p style={{ marginTop: 10 }}>We do not sell your personal data to third parties. For the full Privacy Policy, see the <Link to="/privacy" style={{ color: G, fontWeight: 600 }}>Privacy Policy page</Link> on the Platform.</p>
          </Section>

          <Section num={11} title="Account Suspension and Termination">
            <p>The Platform Operator or an Administrator may suspend or deactivate your account, with or without prior notice, if there are reasonable grounds to believe you have breached this Agreement, engaged in fraudulent activity, or acted in a manner that harms other users or the integrity of the Platform.</p>
            <p style={{ marginTop: 10 }}>Grounds for suspension include but are not limited to: submission of fake reviews, fraudulent verification documents, harassment of other users, creation of multiple accounts, or any conduct listed under Section 5.</p>
            <p style={{ marginTop: 10 }}>Where suspension is imposed, you may request a review by contacting the Platform Operator. If the suspension is found to have been imposed in error, the account will be reinstated promptly.</p>
            <p style={{ marginTop: 10 }}>You may close your account at any time through your account settings. Closure is permanent and results in removal of your data as described in Section 10. Outstanding agreed engagements should be honoured or communicated to the other party before closure.</p>
          </Section>

          <Section num={12} title="Limitation of Liability">
            <div style={{ background: "white", border: "1px solid #d4cfc5", borderRadius: 10, padding: "16px 20px", fontSize: "0.85rem", color: MUTED, lineHeight: 1.7, fontStyle: "italic", marginBottom: 14 }}>
              The Platform is provided as a technology intermediary that facilitates introductions between Customers and Providers. The Platform Operator is not a party to service agreements between users and accepts no liability for the quality, safety, legality, or outcome of any service arranged through the Platform.
            </div>
            <p style={{ marginBottom: 10 }}>To the fullest extent permitted by applicable law, the Platform Operator shall not be liable for:</p>
            <RoleBlock label="" items={[
              "Any loss of income, business opportunity, or reputation suffered by a Provider as a result of a negative review, a low Trust Score, or a failed Booking.",
              "Any harm, injury, or financial loss suffered by a Customer arising from services delivered by a Provider.",
              "Any dispute between a Customer and a Provider regarding payment, service quality, or the terms of their direct agreement.",
              "Any interruption or unavailability of the Platform arising from circumstances beyond our reasonable control.",
              "Any unauthorized access to your account resulting from your failure to maintain the security of your credentials.",
              "Any content posted by users that is false, misleading, defamatory, or infringing.",
            ]} />
            <p style={{ marginTop: 12 }}>Nothing in this clause limits liability for death, personal injury, or fraudulent misrepresentation caused by the Platform Operator's own negligence or wilful misconduct, to the extent such limitation is prohibited by law.</p>
          </Section>

          <Section num={13} title="Dispute Resolution">
            <p>We encourage users to resolve disputes between themselves directly and in good faith before escalating to the Platform Operator. If you have a complaint about another user's conduct on the Platform, you may report it through the contact details in Section 16.</p>
            <p style={{ marginTop: 10 }}>The Platform Operator will review reported disputes and take appropriate action under this Agreement. We do not adjudicate financial disputes between Customers and Providers and have no authority to compel payment or refund.</p>
            <p style={{ marginTop: 10 }}>Any dispute between you and the Platform Operator that cannot be resolved informally shall be subject to the jurisdiction of the courts of Rwanda.</p>
          </Section>

          <Section num={14} title="Governing Law">
            <p>This Agreement is governed by and construed in accordance with the laws of the Republic of Rwanda, including Law No. 058/2021 on the Protection of Personal Data and Privacy, and any other applicable Rwandan legislation.</p>
            <p style={{ marginTop: 10 }}>If any provision of this Agreement is found to be unenforceable under Rwandan law, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remainder of the Agreement shall continue in full force and effect.</p>
          </Section>

          <Section num={15} title="Amendments">
            <p>The Platform Operator may update this Agreement from time to time to reflect changes in the Platform's features, applicable law, or operating practices. When material changes are made, we will update the effective date and, where practicable, notify registered users by email.</p>
            <p style={{ marginTop: 10 }}>Your continued use of the Platform after the effective date of any amendment constitutes acceptance of the revised Agreement. If you do not agree, you must stop using the Platform and may close your account.</p>
          </Section>

          <Section num={16} title="Contact">
            <p style={{ marginBottom: 12 }}>For questions about this Agreement, to report a suspected violation, or to exercise your data rights, please contact:</p>
            <RoleBlock label="" items={[
              <><strong>Platform:</strong> Inzira Works</>,
              <><strong>Operator:</strong> GAKUBA Lassy Orlene</>,
              <><strong>Institution:</strong> African Leadership University, Kigali, Rwanda</>,
              <><strong>Email:</strong> <a href="mailto:lassyorlene@gmail.com" style={{ color: G, fontWeight: 600 }}>lassyorlene@gmail.com</a></>,
              <><strong>Website:</strong> <a href="https://inzira-works.vercel.app" target="_blank" rel="noreferrer" style={{ color: G, fontWeight: 600 }}>inzira-works.vercel.app</a></>,
            ]} />
          </Section>

          {/* Footer */}
          <div style={{ backgroundColor: "white", border: "1px solid #d4cfc5", borderRadius: 10, padding: "22px 24px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginTop: 48, fontSize: "0.78rem", color: MUTED }}>
            <div>
              <strong style={{ color: DARK }}>Inzira Works</strong> — End-User Licence Agreement<br />
              Version 1.0 · Effective July 2026 · Kigali City, Rwanda
            </div>
            <div style={{ textAlign: "right" }}>
              By using this platform you confirm<br />you have read and accepted these terms.
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
