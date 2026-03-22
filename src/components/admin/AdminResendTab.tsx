import { ExternalLink, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminResendTab = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card-surface p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Mail className="size-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Resend — Emails & Campagnes</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Gérez vos relances, campagnes emailing et suivez vos envois directement depuis le tableau de bord Resend.
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <a href="https://resend.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            Ouvrir Resend
          </a>
        </Button>
        <p className="text-xs text-muted-foreground/60">
          Vous serez redirigé vers resend.com pour gérer vos emails.
        </p>
      </div>
    </div>
  );
};

export default AdminResendTab;