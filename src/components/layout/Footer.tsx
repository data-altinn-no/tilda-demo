import { Github, Bug, BookOpen, LucideIcon } from "lucide-react";

interface FooterLink {
  href: string;
  icon: LucideIcon;
  label: string;
}

/**
 * Footer component with links to GitHub repo, issues, and Brønnøysundregistrene wiki
 */
export function Footer() {
  const links: FooterLink[] = [
    {
      href: "https://github.com/data-altinn-no/tilda-demo",
      icon: Github,
      label: "Kildekoden på GitHub",
    },
    {
      href: "https://github.com/data-altinn-no/tilda-demo/issues/new",
      icon: Bug,
      label: "Foreslå forbedringer",
    },
    {
      href: "https://wiki.brreg.no/spaces/TDTD/pages/8749068/Deling+av+tilsynsdata+-+Tilda",
      icon: BookOpen,
      label: "Tilda Wiki (Brreg)",
    },
  ];

  return (
    <footer className="mt-auto py-6 border-t border-slate-200/50 bg-white/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          {links.map(({ href, icon: Icon, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors duration-200 text-sm"
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </a>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          Tilda Demo – Tilsynstilsynet
        </p>
      </div>
    </footer>
  );
}
