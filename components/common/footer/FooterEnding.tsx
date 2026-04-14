const FooterEnding = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-[#4a7c2f] gap-2 pt-6 border-t border-white/10 mt-6">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#d4a017]"></div>
        <span>© 2025 USSEIN Commerce · Marketplace officielle</span>
      </div>
      <div className="flex items-center gap-x-5">
        <span>Confidentialite</span>
        <span>Conditions</span>
        <span>Aide</span>
      </div>
    </div>
  );
};

export default FooterEnding;