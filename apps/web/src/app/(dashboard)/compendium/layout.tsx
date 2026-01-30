import { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Compendium | SPARC RPG",
  description: "Complete rules reference for SPARC RPG - search classes, items, monsters, abilities, and more.",
};

export default function CompendiumLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null {
  return <>{children}</>;
}
