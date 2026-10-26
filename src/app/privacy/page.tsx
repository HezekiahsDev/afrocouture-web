import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { CommunityLink, ContactLink, type LegalSection } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | AfroCouture",
  description: "What AfroCouture collects, why, who can see it, and the choices you have.",
};

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          {LEGAL.brand} (“{LEGAL.operator}”, “we”, “us”) runs a marketplace that connects customers with verified
          artisans who make made-to-measure clothing, and with fabric merchants who supply the textiles. We are the
          data controller for the personal data described in this policy.
        </p>
        <p>
          This policy applies to our website and the services behind it. It is written to meet the Nigeria Data
          Protection Act 2023 (NDPA). For any privacy question or request, message us on <ContactLink />.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>We only ask for what the service needs. What we hold depends on how you use AfroCouture.</p>
        <h3>Everyone with an account</h3>
        <ul>
          <li>Your name, email address and account type (customer, artisan or fabric merchant).</li>
          <li>
            Your password, stored only as a one-way hash. We never store or see the password itself.
          </li>
          <li>
            The 6-digit codes we email to confirm your address or reset your password. They are stored as hashes
            and expire after 10 minutes.
          </li>
          <li>Things you save, such as artisans and fabrics, with the quantities you choose.</li>
          <li>Your in-app notifications and whether you have read them.</li>
        </ul>
        <h3>Customers</h3>
        <ul>
          <li>
            <strong>Fit profile:</strong> body measurements (chest, shoulders, sleeve, length, waist, neck), your
            preferred unit and fit, and optional front and side photos to help with sizing.
          </li>
          <li>
            <strong>Delivery address</strong> for your finished pieces, with a landmark and phone number if you add
            them.
          </li>
        </ul>
        <h3>Artisans</h3>
        <ul>
          <li>Your public profile: display and atelier name, city, craft, bio, experience, specialties, prices, portrait, cover image and portfolio.</li>
          <li>
            <strong>Verification details:</strong> legal name, workshop address, ID type and a photo of your ID
            document, a workshop photo, and guild chapter and membership number if you add them.
          </li>
          <li>
            <strong>Payout details:</strong> bank, account number and the account name your bank confirms.
          </li>
        </ul>
        <h3>Fabric merchants</h3>
        <ul>
          <li>Business name and details, contact information and your fabric listings, prices and photos.</li>
          <li>Verification documents, such as your CAC registration, and your quality declaration.</li>
          <li>Payout details: bank, account number and confirmed account name.</li>
        </ul>
        <h3>Orders and messages</h3>
        <ul>
          <li>
            Commission requests: the garment, your brief, reference images, chosen fabrics, needed-by date, and a
            copy of your measurements and delivery address taken when you send the request.
          </li>
          <li>Quotes, production milestones, shipping and delivery updates, approvals and disputes.</li>
          <li>Messages and images you send in an order’s chat.</li>
          <li>Ratings, reviews and artisan replies.</li>
          <li>
            Payment records: amounts, Paystack references and escrow movements. We do not receive or store your
            card details.
          </li>
        </ul>
        <h3>AI Design Studio (when it launches)</h3>
        <ul>
          <li>The prompts and options you enter, and the images generated for you.</li>
        </ul>
        <h3>Technical data</h3>
        <ul>
          <li>
            Your IP address and basic request details, kept in server logs and used briefly for security, such as
            limiting repeated sign-in attempts.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your data",
    body: (
      <>
        <ul>
          <li>
            <strong>To provide the service</strong> (performing our contract with you): creating your account,
            sending requests to artisans, taking payments, holding them in escrow and paying artisans and merchants,
            running order chat, and showing your saved items.
          </li>
          <li>
            <strong>To verify artisans and merchants</strong> before they appear publicly, to protect customers
            from fraud (our legitimate interest, and our legal obligations).
          </li>
          <li>
            <strong>To keep AfroCouture secure</strong>: rate limiting, detecting abuse, and investigating
            disputes (legitimate interest).
          </li>
          <li>
            <strong>To contact you</strong> about your account and orders, by email and in-app notification. We
            don’t send marketing email without your consent.
          </li>
          <li>
            <strong>To meet legal duties</strong>, such as keeping payment records for tax and accounting.
          </li>
        </ul>
        <p>We do not sell your personal data, and we do not use it for advertising.</p>
      </>
    ),
  },
  {
    id: "who-sees-what",
    title: "Who can see your information",
    body: (
      <>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th scope="col">Who</th>
                <th scope="col">What they can see</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>The public</td>
                <td>
                  Approved artisan profiles and portfolios, published fabric listings, and reviews. A review shows
                  only the reviewer’s first name and last initial.
                </td>
              </tr>
              <tr>
                <td>Your artisan</td>
                <td>
                  For orders you send them: your name, brief, reference images, the copy of your measurements and
                  fit photos, your delivery address, and the order chat.
                </td>
              </tr>
              <tr>
                <td>Fabric merchants</td>
                <td>
                  For orders that include their fabric: the fabric lines and quantities and the artisan’s workshop
                  address to ship to. They do <strong>not</strong> see your measurements, photos or delivery address.
                </td>
              </tr>
              <tr>
                <td>Customers</td>
                <td>An artisan’s public profile, and the quotes, updates and messages on their own orders.</td>
              </tr>
              <tr>
                <td>Our team</td>
                <td>
                  Authorised administrators review verification documents, help resolve disputes and fix failed
                  payouts. Access is limited to what each task needs.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Bank details and ID documents are never shown to other users. We may disclose information if the law
          requires it, or to protect people from fraud or harm.
        </p>
      </>
    ),
  },
  {
    id: "service-providers",
    title: "Service providers we use",
    body: (
      <>
        <p>We rely on a few trusted providers. They process data only to provide their service to us.</p>
        <ul>
          <li>
            <strong>Paystack</strong>: card and bank payments, refunds, payouts to artisans and merchants, and
            checking the account name for a bank account number. You pay on Paystack’s secure page, so your card
            details go to Paystack, not to us.
          </li>
          <li>
            <strong>Cloudinary</strong>: stores and delivers the images you upload, such as portfolios, ID
            documents, fit photos, fabric photos and chat images.
          </li>
          <li>
            <strong>Our email provider</strong>: delivers verification codes and order updates.
          </li>
          <li>
            <strong>Vercel</strong>: hosts the website you are using.
          </li>
          <li>
            <strong>Our own servers</strong>: run the AfroCouture service, its database and its cache.
          </li>
          <li>
            <strong>Google Cloud Vertex AI</strong>: generates design images in AI Design Studio, once that
            feature launches. Only your prompt and chosen options are sent.
          </li>
        </ul>
        <p>
          Some of these providers process data outside Nigeria. Where they do, we rely on the safeguards the NDPA
          allows, such as the provider’s contractual commitments.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <>
        <p>
          We do not use advertising or analytics trackers. To keep you signed in, your browser stores your sign-in
          tokens in local storage on your device. Signing out removes them.
        </p>
        <p>
          While you use the site, your browser may also keep short-lived items in session storage, such as a style
          idea you typed before signing up, or the order you are paying for. These are removed when you close the
          tab.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect your data",
    body: (
      <ul>
        <li>All traffic to AfroCouture is encrypted with HTTPS.</li>
        <li>Passwords and verification codes are stored as one-way hashes.</li>
        <li>Sign-in, sign-up, code and upload requests are rate limited to block guessing and abuse.</li>
        <li>Customer payments are held in escrow and released only when an order is approved or settled.</li>
        <li>Only authorised staff can open verification documents.</li>
      </ul>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <ul>
        <li>Account and profile data: for as long as your account is open.</li>
        <li>
          Orders, payments and escrow records: for as long as tax, accounting and other laws require, even after
          you close your account.
        </li>
        <li>Read notifications: deleted after {LEGAL.notificationRetentionDays} days.</li>
        <li>
          Database backups: kept for about {LEGAL.backupRetentionDays} days, then overwritten. Deleted data
          disappears from backups within that period.
        </li>
        <li>
          Verification documents of rejected or closed artisan and merchant accounts: deleted when no longer
          needed for fraud prevention or legal claims.
        </li>
      </ul>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>Under the NDPA you have the right to:</p>
        <ul>
          <li>access the personal data we hold about you and get a copy;</li>
          <li>correct data that is wrong (most of it you can edit yourself in your profile);</li>
          <li>ask us to delete your data, subject to records we must keep by law;</li>
          <li>object to or ask us to restrict certain processing;</li>
          <li>receive your data in a portable format;</li>
          <li>withdraw consent where we rely on it;</li>
          <li>
            complain to the Nigeria Data Protection Commission (NDPC) if you think we have mishandled your data.
          </li>
        </ul>
        <p>
          To use any of these rights, or to close your account and delete your data, message us on <ContactLink />{" "}
          with your account’s email address. We will confirm the request is yours before acting on it, and reply
          within 30 days.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: <p>AfroCouture is for people aged 18 and over. We do not knowingly collect data from children.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If we change this policy, we will update the date at the top. For significant changes, we will also tell
        you by email or in the app before they take effect.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        Questions or requests about your privacy: <ContactLink />.
        <CommunityLink /> You can also read our{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="LEGAL"
      title="Privacy Policy"
      intro={
        <p>
          Your measurements, photos and payment details are personal. This policy explains what we collect, why we
          need it, who can see it, and how you stay in control.
        </p>
      }
      sections={sections}
      related={{ href: "/terms", label: "Read the Terms of Service" }}
    />
  );
}
