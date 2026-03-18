import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error("Erreur lors de l'envoi. Vérifiez l'adresse email.");
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Mail className="size-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold">Mot de passe oublié</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {sent ? "Vérifiez votre boîte mail" : "Entrez votre email pour réinitialiser"}
          </p>
        </div>

        {sent ? (
          <div className="card-surface p-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Un lien de réinitialisation a été envoyé à <span className="font-medium text-foreground">{email}</span>.
              Cliquez sur le lien dans l'email pour choisir un nouveau mot de passe.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full mt-2">
                <ArrowLeft className="size-4 mr-2" />Retour à la connexion
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-surface p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@asconsulting.fr"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer le lien"}
            </Button>
          </form>
        )}

        <Link to="/login" className="block text-center text-xs text-muted-foreground hover:text-foreground mt-4">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
