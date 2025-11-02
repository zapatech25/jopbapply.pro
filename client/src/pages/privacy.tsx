import Navigation from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-2" data-testid="heading-privacy">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Effective Date: January 2025 | Website: https://jobapply.pro
          </p>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our website and services.
              </p>
              <p>
                By creating an account or using JobApply.pro, you agree to this Privacy Policy. If you do not agree, please do not use the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Who We Are</h2>
              <p>
                JobApply.pro is an online platform providing CV enhancement and job application assistance services. We operate from the United Kingdom and comply with all applicable UK data protection laws.
              </p>
              <p><strong>Data Controller:</strong> Zapa Technologies Ltd (Trading as JobApply.pro)</p>
              <p><strong>Contact:</strong> privacy@jobapply.pro</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information We Collect</h2>
              <p>We collect only the information necessary to provide our services effectively.</p>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">a) Information you provide directly:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Full name</li>
                <li>Email address</li>
                <li>Telephone number</li>
                <li>Password (encrypted)</li>
                <li>Uploaded CVs or documents</li>
                <li>Payment details (processed securely by our payment providers)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">b) Information collected automatically:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address and device type</li>
                <li>Browser type and version</li>
                <li>Usage data (pages visited, time spent, clicks, etc.)</li>
                <li>Cookies and similar tracking technologies (see Section 10)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">c) Information from third parties:</h3>
              <p>
                In limited cases, we may receive information from trusted partners or payment providers where necessary to complete a transaction or verify identity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Information</h2>
              <p>We use your personal data for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your user account</li>
                <li>To provide CV enhancement and job application submission services</li>
                <li>To contact you regarding authorisations, updates, or job submission requests</li>
                <li>To send service notifications and billing confirmations</li>
                <li>To improve our services and website functionality</li>
                <li>To comply with legal obligations</li>
              </ul>
              <p className="font-semibold mt-4">
                We will never sell, rent, or trade your personal information to any third party.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Legal Basis for Processing</h2>
              <p>Under UK GDPR, we rely on the following lawful bases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consent:</strong> When you allow us to submit your CV or contact you.</li>
                <li><strong>Contractual necessity:</strong> When we need your data to provide a service you purchased.</li>
                <li><strong>Legitimate interest:</strong> To improve the platform and ensure a secure user experience.</li>
                <li><strong>Legal obligation:</strong> To meet regulatory or accounting requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Sharing Your Information</h2>
              <p>We may share data only with trusted third parties essential for our operations:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment processors (for secure billing)</li>
                <li>Cloud hosting providers (for platform performance)</li>
                <li>Professional partners (for CV enhancement)</li>
              </ul>
              <p>
                All third parties are bound by strict confidentiality and data protection agreements.
              </p>
              <p className="font-semibold mt-4">
                We will never share your data with employers or job boards without your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Storage and Retention</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your information is securely stored on encrypted servers located within the UK or EEA.</li>
                <li>We retain data only for as long as necessary to provide our services or meet legal requirements.</li>
                <li>You may request deletion of your account and associated data at any time by contacting privacy@jobapply.pro.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
              <p>Under the UK GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion ("right to be forgotten")</li>
                <li>Restrict or object to processing</li>
                <li>Request data portability (transfer of data to another service)</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-4">
                Requests can be made to <a href="mailto:privacy@jobapply.pro" className="text-primary hover:underline">privacy@jobapply.pro</a>. 
                We respond within 30 days in accordance with the ICO's guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Data Security</h2>
              <p>We use advanced security measures to protect your data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>SSL encryption for all data transfers</li>
                <li>Encrypted password storage</li>
                <li>Access restricted to authorised personnel only</li>
                <li>Regular security audits and vulnerability checks</li>
              </ul>
              <p className="mt-4">
                While we take every precaution, no online system can be 100% secure. You are responsible for maintaining the confidentiality of your login credentials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Cookies and Tracking</h2>
              <p>
                Our site uses cookies and analytics tools to enhance user experience and analyse website traffic.
              </p>
              <p>You can:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accept or reject non-essential cookies via the banner on first visit</li>
                <li>Adjust cookie settings in your browser at any time</li>
              </ul>
              <p className="mt-4">
                We use cookies solely to improve usability and performance, never to track individuals for advertising.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. External Links</h2>
              <p>
                JobApply.pro may contain links to external websites (e.g., job boards). We are not responsible for the privacy practices or content of third-party sites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Children's Privacy</h2>
              <p>
                Our services are intended for individuals aged 18 and over. We do not knowingly collect data from minors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be reflected on this page with a new "Effective Date". Continued use of the site after updates constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Contact</h2>
              <p>For all data protection or privacy concerns, please contact:</p>
              <p className="font-semibold mt-4">
                📧 <a href="mailto:privacy@jobapply.pro" className="text-primary hover:underline">privacy@jobapply.pro</a>
              </p>
              <p className="mt-2">
                Zapa Technologies Ltd<br />
                Trading as JobApply.pro<br />
                20 Chain Road<br />
                Manchester, M9 6GR<br />
                United Kingdom
              </p>
              <p className="mt-4">
                If you are not satisfied with our response, you may lodge a complaint with the Information Commissioner's Office (ICO) at{" "}
                <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.ico.org.uk
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
