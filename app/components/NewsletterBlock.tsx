import { siteConfig } from "../lib/site";

export function NewsletterBlock() {
  return (
    <section className="newsletter-block">
      <div>
        <p className="eyebrow">Free starter pack / 01</p>
        <h2>Start with a cleaner definition.</h2>
        <p>
          Get a free Grasshopper organization kit, naming guide, and three
          reusable workflow patterns.
        </p>
      </div>
      <form action={siteConfig.newsletterAction} method="get" target="_blank">
        <label htmlFor="email">Email address</label>
        <div className="input-row">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <button type="submit">Send the pack ↗</button>
        </div>
        <p className="form-note">Useful notes only. Unsubscribe at any time.</p>
      </form>
    </section>
  );
}

