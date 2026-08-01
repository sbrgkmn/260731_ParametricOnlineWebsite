import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main>
      <section className="legal-page shell">
        <p className="eyebrow">Site information</p>
        <h1>Terms of use</h1>
        <h2>Educational material</h2>
        <p>
          Tutorials and workflow notes are provided for learning and reference.
          They do not promise a particular commercial, academic, fabrication, or
          project outcome.
        </p>
        <h2>Downloads</h2>
        <p>
          Downloaded scripts and workflows remain subject to any license or
          usage notes included with the files. Do not resell or redistribute
          another creator&apos;s source material as your own.
        </p>
        <h2>External services</h2>
        <p>
          YouTube, Google Drive, and other linked services are operated
          independently. Their terms apply when you use those services.
        </p>
        <p className="policy-date">Updated: August 1, 2026</p>
      </section>
    </main>
  );
}
