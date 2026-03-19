import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CGV = () => (
  <div className="min-h-screen bg-background text-foreground">
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="size-4" /> Retour au site
      </Link>
      <h1 className="text-3xl font-display font-extrabold mb-8">Conditions Générales de Vente</h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-foreground">

        <h2>1. Objet</h2>
        <p>
          Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre
          <strong> Angelot & Stranieri Consulting</strong>, micro-entreprise, et tout client (ci-après « le Client »)
          dans le cadre de prestations de création de sites web, hébergement, maintenance, et services numériques associés.
        </p>

        <h2>2. Prix et facturation</h2>
        <p>
          Les prix sont indiqués en euros. Conformément au statut de micro-entreprise,
          <strong> la TVA n'est pas applicable (article 293 B du CGI)</strong>.
          Les prix indiqués sont donc nets, sans TVA.
        </p>
        <p>
          Un devis détaillé est établi préalablement à toute prestation. Le devis signé par le Client vaut bon de commande.
        </p>

        <h2>3. Modalités de paiement</h2>
        <p>
          Le paiement s'effectue selon les modalités définies dans le devis :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Achat unique</strong> : 50% à la commande, 50% à la livraison, sauf mention contraire.</li>
          <li><strong>Abonnement</strong> : paiement mensuel par virement ou prélèvement, dû le 1er de chaque mois.</li>
        </ul>
        <p>
          En cas de retard de paiement, des pénalités de retard seront appliquées au taux légal en vigueur,
          ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement (articles L.441-10 et D.441-5 du Code de commerce).
        </p>

        <h2>4. Délais de livraison</h2>
        <p>
          Le délai de livraison est indiqué dans le devis. Le délai moyen est de 7 jours ouvrés à compter de la
          réception de l'ensemble des éléments nécessaires à la réalisation de la prestation.
          Ce délai est donné à titre indicatif et ne constitue pas un engagement ferme.
        </p>

        <h2>5. Obligations du Client</h2>
        <p>Le Client s'engage à :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Fournir les contenus et éléments nécessaires dans les délais convenus.</li>
          <li>Valider les étapes de réalisation dans un délai raisonnable.</li>
          <li>Régler les factures aux échéances prévues.</li>
          <li>Respecter les droits de propriété intellectuelle.</li>
        </ul>

        <h2>6. Propriété intellectuelle</h2>
        <p>
          Le transfert de propriété des livrables au Client n'intervient qu'après paiement intégral du prix convenu.
          Angelot & Stranieri Consulting se réserve le droit de mentionner la réalisation dans son portfolio,
          sauf demande contraire écrite du Client.
        </p>

        <h2>7. Résiliation</h2>
        <p>
          Pour les abonnements, la résiliation peut intervenir à tout moment avec un préavis d'un mois.
          Aucun remboursement ne sera effectué pour le mois en cours.
          En cas de non-paiement de deux mensualités consécutives, le contrat sera résilié de plein droit
          et l'hébergement suspendu.
        </p>

        <h2>8. Responsabilité</h2>
        <p>
          Angelot & Stranieri Consulting s'engage à mettre en œuvre tous les moyens nécessaires à la bonne
          exécution des prestations (obligation de moyens). La responsabilité est limitée au montant des
          sommes effectivement versées par le Client.
        </p>

        <h2>9. Droit de rétractation</h2>
        <p>
          Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique
          pas aux prestations de services pleinement exécutées avant la fin du délai de rétractation, et dont
          l'exécution a commencé avec l'accord préalable et exprès du Client.
        </p>

        <h2>10. Médiation</h2>
        <p>
          En cas de litige, le Client peut recourir gratuitement au service de médiation de la consommation.
          Le médiateur compétent est : [Nom du médiateur à compléter].
          Plateforme européenne de règlement en ligne des litiges :
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer"
            className="text-primary hover:underline ml-1">ec.europa.eu/consumers/odr</a>
        </p>

        <h2>11. Droit applicable</h2>
        <p>
          Les présentes CGV sont soumises au droit français. Tout litige sera de la compétence exclusive
          des tribunaux du ressort du siège social de Angelot & Stranieri Consulting.
        </p>

        <p className="text-xs text-muted-foreground/60 pt-4 border-t border-border/20">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  </div>
);

export default CGV;
