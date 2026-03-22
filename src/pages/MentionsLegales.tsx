import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const MentionsLegales = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Helmet>
      <title>Mentions légales — ASC&D</title>
      <meta name="description" content="Mentions légales du site ascnd.fr — ASC&D (Angelot Stranieri Consulting & Development), agence web à Rodez, Aveyron." />
      <link rel="canonical" href="https://ascnd.fr/mentions-legales" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="size-4" /> Retour au site
      </Link>
      <h1 className="text-3xl font-display font-extrabold mb-8">Mentions légales</h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground">

        <h2>1. Éditeur du site</h2>
        <p>
          Le site <strong>ascnd.fr</strong> est édité par :<br />
          <strong>ASC&D — Angelot Stranieri Consulting & Development</strong><br />
          Micro-entreprise — SIRET : [à compléter]<br />
          Siège social : Rodez, 12000 Aveyron, France<br />
          Email : contact@ascnd.fr<br />
          Directeur de la publication : [Nom du gérant]
        </p>
        <p>TVA non applicable, article 293 B du CGI.</p>

        <h2>2. Hébergeur</h2>
        <p>
          Le site est hébergé par :<br />
          <strong>Lovable / Netlify</strong><br />
          Adresse : San Francisco, CA, États-Unis<br />
          Site web : lovable.dev
        </p>

        <h2>3. Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur le site (textes, images, graphismes, logo, icônes, sons, logiciels, etc.)
          sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.
          Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site,
          quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.
        </p>

        <h2>4. Limitation de responsabilité</h2>
        <p>
          ASC&D ne pourra être tenue responsable des dommages directs et indirects causés au
          matériel de l'utilisateur lors de l'accès au site. ASC&D décline toute responsabilité
          quant à l'utilisation qui pourrait être faite des informations et contenus présents sur le site.
        </p>

        <h2>5. Liens hypertextes</h2>
        <p>
          Le site peut contenir des liens hypertextes vers d'autres sites. ASC&D n'exerce
          aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
        </p>

        <h2>6. Droit applicable</h2>
        <p>
          Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français
          seront seuls compétents.
        </p>

        <p className="text-xs text-muted-foreground/60 pt-4 border-t border-border/20">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  </div>
);

export default MentionsLegales;