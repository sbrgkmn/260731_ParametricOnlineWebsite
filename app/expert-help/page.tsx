import type { Metadata } from "next";
import { siteConfig } from "../lib/site";

export const metadata: Metadata = {
  title: "Work Together",
  description:
    "Book a focused computational-design working session or submit a professional consultancy inquiry.",
  alternates: { canonical: "/expert-help" },
};

export default function ExpertHelpPage() {
  return (
    <main>
      <section className="page-hero shell">
        <p className="eyebrow">Work Together / Two formats</p>
        <h1>Book a 1:1 or start a consultancy.</h1>
        <p>
          Choose a focused one-to-one working session for an immediate technical
          problem, or a consultancy conversation for a larger professional
          project.
        </p>
      </section>

      <section className="section shell help-grid">
        <article id="working-session">
          <p className="eyebrow">01 / Individual</p>
          <h2>1:1 Working Session</h2>
          <p className="booking-price">
            <strong>$49</strong>
            <span>/ 60 minutes</span>
          </p>
          <p>
            Bring a Grasshopper definition, ComfyUI workflow, scripting problem,
            or fabrication question. The session stays fixed in scope and
            focused on live work.
          </p>
          {siteConfig.bookingUrl ? (
            <a
              className="button button-primary"
              href={siteConfig.bookingUrl}
              target="_blank"
              rel="noreferrer"
            >
              Book a Working Session — $49 ↗
            </a>
          ) : (
            <span className="button button-disabled" aria-disabled="true">
              Booking link unavailable
            </span>
          )}
        </article>

        <article id="consultancy">
          <p className="eyebrow">02 / Organizations</p>
          <h2>Professional Consultancy</h2>
          <p>
            For architecture firms, research groups, educators, and larger
            computational-design projects that need strategy, prototyping, or
            custom workflow development.
          </p>
          <a className="text-link" href="#project-inquiry">
            Discuss a Project ↓
          </a>
        </article>
      </section>

      <section className="section section-tinted" id="project-inquiry">
        <div className="shell inquiry-layout">
          <div>
            <p className="eyebrow">Project inquiry</p>
            <h2>Start with the project context.</h2>
            <p>
              A concise brief is enough. Include the current workflow, the
              desired outcome, and the timeline so the right next conversation
              is clear.
            </p>
          </div>
          <form
            className="inquiry-form"
            action={siteConfig.consultancyUrl ?? undefined}
            method="post"
          >
            <label>
              Name
              <input required name="name" autoComplete="name" />
            </label>
            <label>
              Email
              <input required type="email" name="email" autoComplete="email" />
            </label>
            <label>
              Organization
              <input name="organization" autoComplete="organization" />
            </label>
            <label className="full-field">
              Project description
              <textarea required name="project" rows={5} />
            </label>
            <label>
              Software / workflow
              <input required name="software" />
            </label>
            <label>
              Desired outcome
              <input required name="outcome" />
            </label>
            <label>
              Timeline
              <input required name="timeline" />
            </label>
            <div className="form-submit full-field">
              <button
                className="button button-primary"
                type="submit"
                disabled={!siteConfig.consultancyUrl}
              >
                Discuss a Project
              </button>
              {!siteConfig.consultancyUrl && (
                <p>Inquiry submission is currently unavailable.</p>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
