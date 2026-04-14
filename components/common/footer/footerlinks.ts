const footerLinks = [
  {
    title: "Catégories",
    links: [
      { name: "Livres & Cours", href: "/produits?categorie=livres" },
      { name: "Électronique", href: "/produits?categorie=electronique" },
      { name: "Vêtements & Mode", href: "/produits?categorie=mode" },
      { name: "Alimentation", href: "/produits?categorie=alimentation" },
      { name: "Fournitures", href: "/produits?categorie=fournitures" },
      { name: "Services", href: "/produits?categorie=services" },
      { name: "Logement", href: "/produits?categorie=logement" },
      { name: "Sport & Loisirs", href: "/produits?categorie=sport" },
      { name: "Toutes les catégories", href: "/categories" },
    ],
  },
  {
    title: "USSEIN Commerce",
    links: [
      { name: "À propos", href: "/" },
      { name: "Comment ça marche", href: "/" },
      { name: "Devenir vendeur", href: "/devenir-vendeur" },
      { name: "Espace vendeur", href: "/vendeur" },
      { name: "Vendeurs vérifiés", href: "/vendeurs" },
      { name: "Blog & Actualités", href: "/" },
    ],
  },
  {
    title: "Paiement & Commande",
    links: [
      { name: "Payer via Wave", href: "/" },
      { name: "Payer via Orange Money", href: "/" },
      { name: "Commander via WhatsApp", href: "/" },
      { name: "Abonnement vendeur", href: "/devenir-vendeur" },
      { name: "Politique de remboursement", href: "/" },
      { name: "Sécurité des transactions", href: "/" },
    ],
  },
  {
    title: "Aide & Support",
    links: [
      { name: "Centre d'aide", href: "/" },
      { name: "Nous contacter", href: "/" },
      { name: "Signaler un problème", href: "/" },
      { name: "Créer un compte", href: "/auth/sign-up" },
      { name: "Connexion", href: "/auth/sign-in" },
      { name: "FAQ", href: "/" },
    ],
  },
];

export default footerLinks;

