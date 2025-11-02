import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              JobApply.pro
            </h3>
            <p className="text-sm text-muted-foreground">
              Empowering job seekers. Enhancing careers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" data-testid="link-about">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@jobapply.pro"
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="link-support-email"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" data-testid="link-terms">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                    Terms & Conditions
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" data-testid="link-privacy">
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                    Privacy Policy
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li data-testid="text-company-name">Zapa Technologies Ltd</li>
              <li data-testid="text-trading-as">Trading as JobApply.pro</li>
              <li data-testid="text-address">
                20 Chain Road
                <br />
                Manchester, M9 6GR
                <br />
                United Kingdom
              </li>
              <li>
                <a
                  href="mailto:support@jobapply.pro"
                  className="hover:text-foreground"
                  data-testid="link-footer-email"
                >
                  support@jobapply.pro
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p data-testid="text-copyright">
            © {new Date().getFullYear()} Zapa Technologies Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
