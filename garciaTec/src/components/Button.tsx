import { Link } from "react-router";

interface ButtonLinkProps {
  to: string;
  text: string;
  className?: string;
}

export function ButtonLink({ to, text, className = '' }: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={
        "flex justify-center items-center px-10 py-4 bg-primaryBrown-900 text-white text-5xl hover:bg-amber-800 transition-colors h-fit w-full"
      + {className}}
    >
      {text}
    </Link>
  );
}