import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const PolitiqueConfidentialite = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Helmet>
      <title>Politique de confidentialité — Angelot & Stranieri Consulting</title>
      <meta name="description" content="Politique de confidentialité et protection des données personnelles (RGPD) du site asconsulting.fr." />
      <link rel="canonical" href="https://asconsulting.fr/politique-confidentialite" />
    </Helmet>
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="size-4" /> Retour au site
      </Link>
      <h1 className="text-3xl font-display font-extrabold mb-8">Politique de confidentialité</h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground">

        <h2>1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données personnelles est :<br />
          <strong>Angelot & Stranieri Consulting</strong><br />
          Siège social : Rodez, 12000 Aveyron, France<br />
          Email : contact@asconsulting.fr
        </p>

        <h2>2. Données collectées</h2>
        <p>Nous collectons les données suivantes dans le cadre de nos formulaires :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Données d'identification</strong> : nom, prénom</li>
          <li><strong>Données de contact</strong> : adresse email, numéro de téléphone</li>
          <li><strong>Données professionnelles</strong> : secteur d'activité, besoin exprimé</li>
          <li><strong>Données de rendez-vous</strong> : date et heure choisies</li>
        </ul>

        <h2>3. Finalités du traitement</h2>
        <p>Les données sont collectées pour :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Répondre à vos demandes d'audit et de devis</li>
          <li>Organiser les rendez-vous téléphoniques</li>
          <li>Assurer le suivi commercial et la gestion de la relation client</li>
          <li>Établir les devis et factures</li>
          <li>Améliorer nos services</li>
        </ul>

        <h2>4. Base légale</h2>
        <p>
          Le traitement des données repose sur :<br />
          — <strong>L'exécution d'un contrat</strong> ou de mesures précontractuelles (article 6.1.b du RGPD)<br />
          — <strong>Le consentement</strong> de l'utilisateur lors de la soumission du formulaire (article 6.1.a du RGPD)<br />
          — <strong>L'intérêt légitime</strong> de l'entreprise pour la prospection commerciale (article 6.1.f du RGPD)
        </p>

        <h2>5. Durée de conservation</h2>
        <p>
          Les données personnelles sont conservées pendant une durée maximale de :<br />
          — <strong>3 ans</strong> à compter du dernier contact pour les prospects<br />
          — <strong>5 ans</strong> après la fin de la relation commerciale pour les clients (obligations comptables)<br />
          — <strong>1 an</strong> pour les données de diagnostic anonymisées
        </p>

        <h2>6. Destinataires des données</h2>
        <p>
          Les données sont accessibles uniquement aux membres de Angelot & Stranieri Consulting dans le
          cadre de leurs fonctions. Elles ne sont ni vendues, ni louées, ni cédées à des tiers.
        </p>
        <p>
          Les sous-traitants techniques suivants peuvent avoir accès aux données dans le cadre de leurs prestations :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase</strong> (hébergement base de données) — Serveurs UE</li>
          <li><strong>Lovable / Netlify</strong> (hébergement du site)</li>
        </ul>

        <h2>7. Vos droits</h2>
        <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
          <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
          <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
          <li><strong>Droit à la limitation</strong> : restreindre le traitement</li>
          <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</li>
          <li><strong>Droit d'opposition</strong> : vous opposer au traitement pour motif légitime</li>
        </ul>
        <p>
          Pour exercer ces droits, envoyez un email à <strong>contact@asconsulting.fr</strong> accompagné
          d'une copie de votre pièce d'identité. Nous répondrons dans un délai de 30 jours.
        </p>

        <h2>8. Cookies</h2>
        <p>
          Le site utilise uniquement des cookies techniques strictement nécessaires au fonctionnement
          (authentification, session). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
          Ces cookies ne nécessitent pas de consentement préalable conformément à la directive ePrivacy.
        </p>

        <h2>9. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger
          vos données contre tout accès non autorisé, modification, divulgation ou destruction :
          chiffrement des connexions (HTTPS/TLS), contrôle d'accès, sauvegardes régulières.
        </p>

        <h2>10. Réclamation</h2>
        <p>
          Si vous estimez que le traitement de vos données ne respecte pas la réglementation, vous pouvez
          adresser une réclamation à la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) :
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">www.cnil.fr</a>
        </p>

        <p className="text-xs text-muted-foreground/60 pt-4 border-t border-border/20">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  </div>
);

export default PolitiqueConfidentialite;
