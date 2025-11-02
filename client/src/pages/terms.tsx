import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function TermsPage() {
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user"],
  });

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation user={user} onLogout={handleLogout} />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">

        <div className="bg-background rounded-lg p-8 shadow-sm">
          <h1 className="text-4xl font-bold mb-2" data-testid="heading-terms">
            Terms and Conditions
          </h1>
          <p className="text-muted-foreground mb-8">
            Effective Date: January 2025 | Website: https://jobapply.pro
          </p>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                By using our website and services, you agree to these Terms and Conditions. Please read them carefully before accessing or using our services. If you do not agree, you must not use the platform.
              </p>
              <p>
                JobApply.pro is a digital platform providing CV enhancement and job application assistance services. We do not guarantee employment and are not a recruitment agency. Our service is strictly limited to improving users' CVs and, upon explicit consent, submitting them to public job boards or employer listings on their behalf.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Our Services</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>CV Enhancement:</strong> We review and improve users' CVs for structure, grammar, layout, and clarity.</li>
                <li><strong>Application Submission (Optional):</strong> With your explicit permission, we may assist in submitting your CV to job boards or employers.</li>
                <li><strong>Application Dashboard:</strong> Users can view, track, and export a full record of submissions, including company names, dates, and platforms used.</li>
                <li><strong>Transparency:</strong> We will never submit your CV to any company or job board without your clear, prior consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. No Employment Guarantee</h2>
              <p>We do not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Guarantee interviews or job placements.</li>
                <li>Represent or act on behalf of employers.</li>
                <li>Collect commissions, referral fees, or incentives from job boards or companies.</li>
              </ul>
              <p>
                Our sole purpose is to assist you in managing your job search more efficiently. Success depends on your qualifications, experience, and employer decisions beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You confirm that all personal and professional information you provide is accurate and up to date.</li>
                <li>You authorise JobApply.pro to use your submitted CV solely for the agreed purpose of enhancement and authorised submissions.</li>
                <li>You must not upload misleading, unlawful, or defamatory material.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Consent for Submissions</h2>
              <p>Before any submission:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You will be notified of each opportunity and the platform or employer to which we intend to submit.</li>
                <li>Your explicit consent will be requested and recorded.</li>
                <li>We will not proceed without your approval.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Payments and Refunds</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service fees are clearly stated before checkout.</li>
                <li>Payments are processed securely via trusted gateways.</li>
                <li>Refunds are issued only if the service has not been initiated or in the event of proven technical failure.</li>
                <li>Once a CV has been enhanced or submission activity has commenced, refunds cannot be provided.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Protection and Privacy</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>We handle all personal data in accordance with the UK Data Protection Act 2018 and GDPR.</li>
                <li>Your data will only be used for the purposes of providing our services.</li>
                <li>We will never sell or share your information with third parties without consent.</li>
                <li>You may request deletion of your account and data at any time by contacting our support team.</li>
                <li>Refer to our <Link href="/privacy"><span className="text-primary hover:underline cursor-pointer">Privacy Policy</span></Link> for full details.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
              <p>
                All website content, software, graphics, and branding belong to JobApply.pro. Users may not reproduce, modify, or redistribute any part of the site without prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p>JobApply.pro shall not be liable for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Employment decisions made by employers or third parties.</li>
                <li>Loss of income, opportunities, or data.</li>
                <li>Unauthorised access due to user negligence (e.g. weak passwords).</li>
              </ul>
              <p>
                We make every effort to provide accurate and reliable services but do not guarantee uninterrupted availability or error-free functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Compliance</h2>
              <p>JobApply.pro operates in compliance with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>UK GDPR and Data Protection Act 2018</li>
                <li>Consumer Contracts Regulations 2013</li>
                <li>ASA and CMA guidelines on fair marketing</li>
              </ul>
              <p>
                We are not a recruitment agency under the Employment Agencies Act 1973 and do not act as one.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
              <p>
                These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the English courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
              <p>If you have any questions about these Terms, please contact:</p>
              <p className="font-semibold mt-4">
                📧 <a href="mailto:support@jobapply.pro" className="text-primary hover:underline">support@jobapply.pro</a>
              </p>
              <p className="mt-2">
                Or via mail:<br />
                Zapa Technologies Ltd<br />
                Trading as JobApply.pro<br />
                20 Chain Road<br />
                Manchester, M9 6GR<br />
                United Kingdom
              </p>
            </section>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
