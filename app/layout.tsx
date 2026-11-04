import type { Metadata } from "next";

import { FICTIONAL_LABEL } from "@/data/atlas";
import { getMetaMode } from "@/lib/meta";

import { PageEyebrow, StepFooter } from "./page-frame";
import { StepNav } from "./step-nav";
import { TopBar } from "./top-bar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrossSight — Project Atlas",
  description: "Cross-checks a project pack — contract, blueprint, and site photo — and proves every disagreement.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const mode = await getMetaMode();

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="banner" role="note">
          {FICTIONAL_LABEL}
        </div>
        <TopBar mode={mode} />
        <div className="shell">
          <aside className="sidebar">
            <StepNav mode={mode} />
          </aside>
          <div className="main">
            <main className="content" id="main">
              <PageEyebrow />
              {children}
              <StepFooter />
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
