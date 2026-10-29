import type { Metadata } from "next";

import { FICTIONAL_LABEL } from "@/data/atlas";
import { getMetaMode } from "@/lib/meta";

import { StepNav } from "./step-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrossSight",
  description: "Enterprise Truth Engine — cross-checks contract, blueprint, and site photo.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const mode = await getMetaMode();

  return (
    <html lang="en">
      <body>
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-mark">CS</span>
            <span>
              <strong>CrossSight</strong>
              <span className="brand-sub">Truth Engine · Project Atlas</span>
            </span>
          </div>
          <StepNav />
          <div className={`mode mode-${mode}`}>
            {mode === "mock" ? "Mock mode — no live Meta calls" : "Live mode"}
          </div>
        </aside>
        <div className="main">
          <div className="banner" role="note">
            {FICTIONAL_LABEL}
          </div>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
