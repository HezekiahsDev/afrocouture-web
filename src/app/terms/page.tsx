import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { CommunityLink, ContactLink, type LegalSection } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service | AfroCouture",
  description: "The rules for commissioning, making and selling on AfroCouture, including payments, escrow and disputes.",
};

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <>
        <p>
          These terms are an agreement between you and {LEGAL.operator}, which runs {LEGAL.brand} (“we”, “us”).
          They apply whenever you use our website or services. By creating an account or placing an order, you
          accept them.
        </p>
        <p>
          Our <Link href="/privacy">Privacy Policy</Link> explains how we handle your personal data and forms part
          of these terms.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <ul>
        <li>You must be at least 18 and able to enter a binding contract.</li>
        <li>Each account belongs to one person or business. Give accurate information and keep it up to date.</li>
        <li>
          Keep your password private. You are responsible for activity on your account. Tell us straight away on{" "}
          <ContactLink /> if you think someone else has used it.
        </li>
        <li>We confirm your email address with a one-time code before your account becomes active.</li>
      </ul>
    ),
  },
  {
    id: "roles",
    title: "Customers, artisans and merchants",
    body: (
      <>
        <p>AfroCouture has three kinds of account:</p>
        <ul>
          <li>
            <strong>Customers</strong> commission garments and buy fabric for them.
          </li>
          <li>
            <strong>Artisans</strong> (tailors and designers) quote for and make commissions.
          </li>
          <li>
            <strong>Fabric merchants</strong> list textiles and ship them to artisans for orders.
          </li>
        </ul>
        <p>
          Artisans and merchants must pass our verification review before they appear publicly or receive orders.
          We may ask for identity, business and bank documents, and we may refuse or withdraw verification.
          Verification means we checked the documents provided; it is not a guarantee of the quality of anyone’s
          work.
        </p>
      </>
    ),
  },
  {
    id: "marketplace",
    title: "Our role as a marketplace",
    body: (
      <p>
        AfroCouture provides the platform, payment handling and support. Artisans and merchants are independent
        businesses, not our employees or agents. The contract to make a garment is between the customer and the
        artisan, and the sale of fabric is between the merchant and the customer. We do not make the garments or
        supply the fabric ourselves, but we hold payments in escrow and help resolve problems as these terms
        describe.
      </p>
    ),
  },
  {
    id: "commissions",
    title: "How a commission works",
    body: (
      <ol className="legal-steps">
        <li>
          <strong>Request.</strong> The customer sends an artisan a brief, reference images, chosen fabrics and a
          copy of their measurements.
        </li>
        <li>
          <strong>Quote.</strong> The artisan quotes for workmanship and delivery, with an estimated ready date, or
          declines.
        </li>
        <li>
          <strong>Payment.</strong> The customer accepts by paying the full amount through Paystack. The payment is
          held in escrow.
        </li>
        <li>
          <strong>Making.</strong> Merchants ship the fabric to the atelier. The artisan updates the order through
          cutting, fitting and finishing.
        </li>
        <li>
          <strong>Delivery.</strong> The artisan hands over the piece and marks the order delivered.
        </li>
        <li>
          <strong>Approval or dispute.</strong> The customer approves the order, which releases payment, or opens a
          dispute if something is wrong.
        </li>
      </ol>
    ),
  },
  {
    id: "payments",
    title: "Payments, fees and escrow",
    body: (
      <ul>
        <li>
          Payments are processed by Paystack. Prices are in Nigerian naira. Paystack’s own terms also apply to your
          payment.
        </li>
        <li>
          The total shown before you pay includes the artisan’s workmanship and delivery, the fabric, and our
          platform fee, which is added on top and shown separately.
        </li>
        <li>
          We hold the payment in escrow. Each fabric merchant is paid once the artisan confirms their fabric has
          arrived. The artisan is paid their workmanship and delivery when the customer approves the order.
        </li>
        <li>
          If the customer neither approves nor disputes within {LEGAL.autoApproveDays} days of delivery, the order
          completes automatically and the remaining payment is released.
        </li>
        <li>
          Artisans and merchants must keep accurate bank details on their profile. We are not responsible for
          payouts delayed or lost because of incorrect bank details. We retry failed payouts once the details are
          fixed.
        </li>
        <li>
          Do not arrange to pay outside AfroCouture for an order started here. Off-platform payments are not covered
          by escrow or our dispute process.
        </li>
      </ul>
    ),
  },
  {
    id: "cancellations",
    title: "Cancellations",
    body: (
      <ul>
        <li>A customer can cancel a request at no cost at any time before paying.</li>
        <li>An artisan can decline a request, or withdraw a quote, before it is paid.</li>
        <li>
          Once an order is paid, it cannot be cancelled on its own. If something goes wrong, use the order chat to
          sort it out with the artisan, or open a dispute.
        </li>
        <li>
          If a payment arrives that does not match the current quote, for example because the quote changed, we
          refund it automatically.
        </li>
      </ul>
    ),
  },
  {
    id: "disputes",
    title: "Disputes and refunds",
    body: (
      <>
        <ul>
          <li>
            A customer can open a dispute after paying and before approving the order, giving the reason. The
            payment stays in escrow while we review it.
          </li>
          <li>
            We look at the order, its timeline, the chat and any evidence both sides give us. We then decide to
            release the payment to the artisan, or to refund the customer in full or in part, with anything not
            refunded going to the people who did the work. We explain the decision to both sides.
          </li>
          <li>
            Our decision settles the order on AfroCouture. It does not remove any rights you have under Nigerian
            law.
          </li>
          <li>
            Refunds are paid through Paystack to the original payment method. How long they take to arrive depends
            on your bank.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "fit",
    title: "Measurements and fit",
    body: (
      <ul>
        <li>
          Customers are responsible for the measurements in their fit profile. Artisans work from the copy taken
          when the request is sent.
        </li>
        <li>
          Artisans should raise any question about measurements, fabric or the brief in the order chat before
          cutting.
        </li>
        <li>
          Handmade garments can differ slightly from photos and reference images. A garment made to the agreed
          measurements and brief is not faulty because of small differences of this kind.
        </li>
      </ul>
    ),
  },
  {
    id: "fabrics",
    title: "Fabric listings",
    body: (
      <ul>
        <li>
          Merchants must describe fabrics accurately, including the type, colour, origin and unit, and keep prices
          and stock up to date.
        </li>
        <li>
          Wholesale price tiers apply automatically to the quantity ordered, at the prices shown when the request
          was sent.
        </li>
        <li>
          Merchants must ship promptly to the artisan’s atelier and mark each fabric as shipped. Payment is released
          when the artisan confirms it arrived.
        </li>
      </ul>
    ),
  },
  {
    id: "reviews",
    title: "Reviews",
    body: (
      <ul>
        <li>
          Customers can rate and review an artisan after an order completes, for up to {LEGAL.reviewWindowDays}{" "}
          days. Reviews must be honest and about that order.
        </li>
        <li>
          Reviews appear publicly on the artisan’s profile with the customer’s first name and last initial. The
          artisan can post one public reply.
        </li>
        <li>
          We may hide reviews that are abusive, discriminatory, irrelevant, contain personal information, or break
          these terms. We do not hide reviews just because they are negative.
        </li>
        <li>Offering or accepting anything in return for a review, or reviewing your own business, is not allowed.</li>
      </ul>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>When using AfroCouture, you must not:</p>
        <ul>
          <li>break the law, or help anyone else to;</li>
          <li>harass, threaten or discriminate against anyone;</li>
          <li>post content that is sexual, violent, hateful or misleading, or that infringes someone’s rights;</li>
          <li>sell counterfeit goods or misdescribe fabric or work;</li>
          <li>impersonate anyone, or create accounts to get around a suspension;</li>
          <li>collect other users’ data, or use their contact details for anything other than the order;</li>
          <li>interfere with the service, test its security without our permission, or scrape it.</li>
        </ul>
      </>
    ),
  },
  {
    id: "content",
    title: "Your content",
    body: (
      <ul>
        <li>
          You keep ownership of what you upload, such as portfolios, photos, reference images, listings, messages
          and reviews.
        </li>
        <li>
          You give us a non-exclusive, royalty-free licence to store, display and adapt it (for example, resizing
          images) as needed to run and promote AfroCouture. The licence ends when you delete the content or your
          account, except for content already shared on orders or reviews.
        </li>
        <li>
          Only upload content you own or have permission to use. If you share a photo of someone else’s design as a
          reference, the artisan uses it only as inspiration for your order.
        </li>
        <li>
          If you think content on AfroCouture infringes your rights, message us on <ContactLink /> and we will look into it.
        </li>
      </ul>
    ),
  },
  {
    id: "ai-studio",
    title: "AI Design Studio",
    body: (
      <p>
        AI Design Studio is coming soon. When it launches, it will create design concepts from your descriptions.
        Concepts are for inspiration: they may be inaccurate, they may not be unique, and an artisan’s finished
        piece may differ from them. A daily limit applies. You must not use the studio to imitate real people or
        brands, or to create content that breaks these terms.
      </p>
    ),
  },
  {
    id: "suspension",
    title: "Suspension and closing your account",
    body: (
      <ul>
        <li>
          You can close your account at any time by messaging us on <ContactLink />. Orders already paid must be completed
          or settled first.
        </li>
        <li>
          We may suspend or close an account, remove content or withdraw verification if you break these terms, if
          we suspect fraud, or if the law requires it. Where we can, we will tell you why and give you a chance to
          respond.
        </li>
        <li>
          Money in escrow for open orders is still released or refunded under these terms if an account is closed.
        </li>
      </ul>
    ),
  },
  {
    id: "liability",
    title: "Our responsibility to you",
    body: (
      <>
        <ul>
          <li>
            We work to keep AfroCouture available and accurate, but we provide it “as is”. We cannot promise it will
            always be uninterrupted or error-free.
          </li>
          <li>
            Artisans are responsible for the garments they make, and merchants for the fabric they supply. To the
            extent the law allows, we are not responsible for their acts or omissions.
          </li>
          <li>
            To the extent the law allows, we are not liable for indirect or consequential losses, such as lost
            profits or opportunities. Our total liability to you in connection with an order is limited to the
            amount paid through AfroCouture for that order.
          </li>
          <li>
            Nothing in these terms limits liability for fraud, for death or personal injury caused by negligence,
            or anything else that cannot be limited under Nigerian law, including your rights under the Federal
            Competition and Consumer Protection Act.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of the Federal Republic of {LEGAL.country}. If a disagreement cannot be
        settled with our support team, it will be decided by the courts of {LEGAL.country}.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms as AfroCouture grows. We will change the date at the top and, for significant
        changes, tell you by email or in the app before they take effect. Orders already paid continue under the
        terms that applied when they were paid.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        Questions about these terms: <ContactLink />.
        <CommunityLink />
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      kicker="LEGAL"
      title="Terms of Service"
      intro={
        <p>
          The rules for commissioning, making and selling on AfroCouture, including how payments are held in
          escrow, how disputes are settled, and what we expect from everyone in the atelier.
        </p>
      }
      sections={sections}
      related={{ href: "/privacy", label: "Read the Privacy Policy" }}
    />
  );
}
