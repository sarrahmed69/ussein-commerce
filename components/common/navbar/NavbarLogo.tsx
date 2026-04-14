import Link from "next/link";
const NavbarLogo = () => {
  return (
    <Link href="/" title="Retour a l accueil" aria-label="USSEIN Commerce">
      <div className="flex items-center gap-2">
        <img
          src="/images/USSEIN-logo.jpg"
          alt="USSEIN Commerce"
          width={140}
          height={45}
          className="object-contain"
          onError={(e: any) => { e.target.style.display="none"; }}
        />
      </div>
    </Link>
  );
};
export default NavbarLogo;