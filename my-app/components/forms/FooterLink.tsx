import Link from "next/link";
import { cn } from "@/lib/utils";

interface FooterLinkProps {
  text: string;
  linkText: string;
  href: string;
}

const FooterLink = ({ text, linkText, href }: FooterLinkProps) => {
  return (
    <div className="text-center pt-4">
      <p className="text-sm text-muted-foreground">
        {text}
        {` `}
        <Link
          href={href}
          className={cn(
            "font-medium transition-colors duration-200",
            "text-primary hover:text-primary/80",
            "underline-offset-4 hover:underline"
          )}
        >
          {linkText}
        </Link>
      </p>
    </div>
  );
};

export default FooterLink;