"use client";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import Link from "next/link";
import { TbCheck, TbArrowRight, TbStar, TbShoppingBag, TbUsers, TbCurrencyDollar, TbShield, TbPhone } from "react-icons/tb";

const avantages = [
  { icon: "🛒", titre: "Boutique en ligne", desc: "Créez votre vitrine et publiez vos produits en quelques minutes." },
  { icon: "💸", titre: "Zéro commission", desc: "Gardez 100% de vos ventes. Seulement 1 000 FCFA/mois." },
  { icon: "📦", titre: "Produits illimités", desc: "Publiez autant de produits que vous voulez sans restriction." },
  { icon: "📲", titre: "Commandes WhatsApp", desc: "Recevez vos commandes directement sur WhatsApp." },
  { icon: "💳", titre: "Wave & Orange Money", desc: "Acceptez les paiements mobiles les plus utilisés au Sénégal." },
  { icon: "🎓", titre: "Réservé aux étudiants", desc: "Une communauté de confiance sur le campus USSEIN." },
];

const etapes = [
  { num: "01", titre: "Créez votre compte", desc: "Inscrivez-vous avec votre email universitaire." },
  { num: "02", titre: "Configurez votre boutique", desc: "Ajoutez votre logo, description et catégories." },
  { num: "03", titre: "Publiez vos produits", desc: "Photos, prix, description — prêt en 2 minutes." },
  { num: "04", titre: "Recevez des commandes", desc: "Les clients vous contactent via WhatsApp." },
];

const temoignages = [
  { nom: "Aminata D.", role: "Étudiante en Gestion", text: "J'ai vendu mes premières tenues en 3 jours. Le campus est une vraie opportunité !", stars: 5 },
  { nom: "Moussa K.", role: "Étudiant en Informatique", text: "Je vends mes services de réparation PC. 15 clients ce mois-ci !", stars: 5 },
  { nom: "Fatou S.", role: "Étudiante en Droit", text: "Mon service de cuisine maison cartonne. Merci USSEIN Commerce !", stars: 5 },
];

export default function DevenirVendeurPage() {
  return (
    <div style={{ background: "#fff", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #1a3d10 0%, #2d5a1b 60%, #4a7c2f 100%)", padding: "80px 24px 100px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, background: "rgba(212,160,23,.12)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, background: "rgba(255,255,255,.05)", borderRadius: "50%" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(212,160,23,.2)", border: "1.5px solid rgba(212,160,23,.4)", borderRadius: 100, padding: "6px 18px", color: "#d4a017", fontSize: 12, fontWeight: 700, marginBottom: 24 }}>
            ✦ USSEIN Commerce — Campus Marketplace
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .1 }}
            style={{ color: "white", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-.02em" }}>
            Vendez sur le campus.<br />
            <span style={{ color: "#d4a017" }}>Gagnez votre indépendance.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6, delay: .2 }}
            style={{ color: "rgba(255,255,255,.75)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 36px" }}>
            Créez votre boutique, publiez vos produits, recevez vos commandes. <strong style={{ color: "white" }}>1 000 FCFA/mois</strong> — aucune commission.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .3 }}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/vendeur/creer"
              style={{ background: "#d4a017", color: "#1a3d10", borderRadius: 12, padding: "14px 32px", fontWeight: 800, fontSize: ".95rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
              Commencer maintenant <TbArrowRight size={18} />
            </Link>
            <a href="#avantages"
              style={{ background: "rgba(255,255,255,.1)", color: "white", borderRadius: 12, padding: "14px 32px", fontWeight: 700, fontSize: ".95rem", textDecoration: "none", border: "1.5px solid rgba(255,255,255,.2)" }}>
              En savoir plus
            </a>
          </motion.div>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
            {[{ v: "1 000 FCFA", l: "Par mois seulement" }, { v: "0%", l: "Commission" }, { v: "∞", l: "Produits" }, { v: "24/7", l: "Support WhatsApp" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#d4a017" }}>{s.v}</div>
                <div style={{ fontSize: ".75rem", color: "rgba(255,255,255,.6)", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section id="avantages" style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", background: "#f0f8e8", color: "#2d5a1b", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Pourquoi nous rejoindre</div>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, color: "#1a3d10", margin: 0 }}>Tout ce qu'il vous faut pour vendre</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {avantages.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }}
                style={{ background: "#f8faf5", borderRadius: 16, padding: "28px 24px", border: "1.5px solid #e8ede4" }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{a.icon}</div>
                <div style={{ fontWeight: 800, color: "#1a3d10", fontSize: "1.05rem", marginBottom: 8 }}>{a.titre}</div>
                <div style={{ color: "#777", fontSize: ".88rem", lineHeight: 1.6 }}>{a.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ETAPES */}
      <section style={{ padding: "80px 24px", background: "#f8faf5" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", background: "#fff8e1", color: "#a07010", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Comment ça marche</div>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, color: "#1a3d10", margin: 0 }}>Lancez-vous en 4 étapes</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            {etapes.map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }}
                style={{ background: "white", borderRadius: 16, padding: "28px 20px", textAlign: "center", border: "1.5px solid #e8ede4", position: "relative" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#e8ede4", marginBottom: 8 }}>{e.num}</div>
                <div style={{ fontWeight: 800, color: "#1a3d10", fontSize: ".95rem", marginBottom: 8 }}>{e.titre}</div>
                <div style={{ color: "#888", fontSize: ".82rem", lineHeight: 1.6 }}>{e.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", background: "#f0f8e8", color: "#2d5a1b", borderRadius: 100, padding: "6px 18px", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>Témoignages</div>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 900, color: "#1a3d10", margin: 0 }}>Ils vendent déjà sur USSEIN</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {temoignages.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }}
                style={{ background: "#f8faf5", borderRadius: 16, padding: "28px 24px", border: "1.5px solid #e8ede4" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                  {Array(t.stars).fill(0).map((_, j) => <TbStar key={j} size={16} style={{ color: "#d4a017", fill: "#d4a017" }} />)}
                </div>
                <p style={{ color: "#555", fontSize: ".9rem", lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ fontWeight: 700, color: "#1a3d10", fontSize: ".88rem" }}>{t.nom}</div>
                <div style={{ color: "#aaa", fontSize: ".78rem" }}>{t.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(135deg, #1a3d10, #2d5a1b)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ color: "white", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, marginBottom: 16 }}>Prêt à vendre sur le campus ?</h2>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: "1rem", marginBottom: 36, lineHeight: 1.7 }}>Rejoignez les étudiants entrepreneurs d'USSEIN. Premier mois offert.</p>
          <Link href="/vendeur/creer"
            style={{ background: "#d4a017", color: "#1a3d10", borderRadius: 12, padding: "16px 40px", fontWeight: 800, fontSize: "1rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
            Créer ma boutique <TbArrowRight size={20} />
          </Link>
        </div>
      </section>

    </div>
  );
}