import { HelpCircle, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  return (
    <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto">
      <div className="comic-panel p-6 sm:p-10 text-center">
        <div className="w-16 h-16 mx-auto bg-yellow border-[2.5px] border-ink comic-shadow-sm flex items-center justify-center mb-6">
          <HelpCircle className="h-8 w-8 text-ink" />
        </div>
        <h1 className="text-ink mb-3">Help &amp; docs are on the way</h1>
        <p className="text-ink-soft mb-8">
          We&apos;re writing guides for setting up invoices, reminders, and UPI
          payments. Until then, reach out and we&apos;ll help you directly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="gap-2" asChild>
            <a href="https://x.com/rohiitcodes">
              <Mail className="h-4 w-4" />
              Contact us
            </a>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a
              href="https://chat.whatsapp.com/ISXLzprKTWdJjiv4dOaS2F?mode=ac_t"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Users className="h-4 w-4" />
              Join the community
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
