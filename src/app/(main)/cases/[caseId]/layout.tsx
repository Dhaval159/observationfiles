import Link from "next/link";
import { caseSubNavigation } from "@/config/navigation";

interface CaseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ caseId: string }>;
}

export default async function CaseLayout({ children, params }: CaseLayoutProps) {
  const { caseId } = await params;
  const navItems = caseSubNavigation(caseId);

  return (
    <div className="flex flex-1 flex-col">
      <nav className="border-border flex gap-1 overflow-x-auto border-b px-6 py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
