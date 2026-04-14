"use client";
import { motion } from "framer-motion";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};
const FooterLogo = () => {
  return (
    <motion.div className="footer-logo-container" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <motion.div className="mb-5" variants={itemVariants}>
        <img src="/images/USSEIN-logo.jpg" alt="USSEIN Commerce" width={160} height={55} className="object-contain" />
      </motion.div>
      <motion.p className="text-[#7aab5a] text-sm leading-relaxed mb-4" variants={itemVariants}>
        La marketplace officielle du campus USSEIN. Achetez et vendez facilement entre etudiants de l Universite du Sine Saloum El-Hadj Ibrahima Niass.
      </motion.p>
      <motion.div variants={itemVariants}>
        <h3 className="text-[#d4a017] text-xs font-bold uppercase tracking-wider mb-3">Modes de paiement</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <div title="Wave" className="bg-[#29ABE2] rounded-xl px-4 py-2 flex items-center gap-2 text-white text-xs font-bold">Wave</div>
          <div title="Orange Money" className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-2 text-orange-500 text-xs font-bold">Orange Money</div>
          <div title="Cash FCFA" className="bg-[#2d5a1b] rounded-xl px-4 py-2 flex items-center gap-2 text-white text-xs font-bold">Cash FCFA</div>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default FooterLogo;