import Link from "next/link";

interface LinkItem {
  name: string;
  href: string;
}
interface FooterLinksListProps {
  title: string;
  links?: LinkItem[];
}

const FooterLinksList: React.FC<FooterLinksListProps> = ({ title, links }) => {
  return (
    <div className="footer-links-content">
      <div className="mb-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-[0.18em] mb-2">
          {title}
        </h3>
        <div className="w-6 h-0.5 bg-[#d4a017]" />
      </div>
      <ul className="space-y-2.5">
        {links?.map((link) => (
          <li key={link.name}>
            <Link
              href={link.href}
              title={link.name}
              aria-label={link.name}
              className="text-[13px] text-blue-200/60 hover:text-[#d4a017] transition-colors duration-200 flex items-center gap-1.5 group"
            >
              <span className="w-0 group-hover:w-2 h-px bg-[#d4a017] transition-all duration-200 inline-block flex-shrink-0" />
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default FooterLinksList;