import type { Metadata } from "next";
import { sessions, siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "Working Sessions",
  description: "Book focused one-to-one computational design support with Sabri Gokmen.",
  alternates: { canonical: "/sessions" },
};

export default function SessionsPage() {
  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">Sessions / One-to-one</p>
        <h1>Focused help for the difficult part.</h1>
        <p>Bring a workflow, project, script, or technical teaching problem. Leave with progress and a clear next step.</p>
      </section>
      <section className="shell section">
        <div className="session-grid">
          {sessions.map((session, index) => (
            <article className="session-card" key={session.title}>
              <span className="session-index">0{index + 1}</span>
              <div className="meta-row"><span>{session.duration}</span><span>{session.price}</span></div>
              <h2>{session.title}</h2>
              <p>{session.description}</p>
              <dl><dt>Best for</dt><dd>{session.bestFor}</dd></dl>
              <a className="button button-secondary" href={session.bookingUrl} target="_blank" rel="noreferrer">Choose session ↗</a>
            </article>
          ))}
        </div>
      </section>
      <section className="calendly-section shell section">
        <div className="section-heading">
          <div><p className="eyebrow">Availability / Live calendar</p><h2>Choose a time.</h2></div>
          <a className="text-link" href={siteConfig.calendlyUrl} target="_blank" rel="noreferrer">Open Calendly ↗</a>
        </div>
        <iframe title="Book a Parametric.Online session with Calendly" src={`${siteConfig.calendlyUrl}?embed_domain=parametric.online&embed_type=Inline`} loading="lazy" />
      </section>
      <section className="shell process-strip">
        <div><span>01</span><strong>Send context</strong><p>Share files and the goal before the call.</p></div>
        <div><span>02</span><strong>Work live</strong><p>Use the session for decisions and real progress.</p></div>
        <div><span>03</span><strong>Continue clearly</strong><p>Leave with notes and a prioritized next step.</p></div>
      </section>
    </main>
  );
}
