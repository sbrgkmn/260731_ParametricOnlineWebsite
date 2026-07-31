export const siteConfig = {
  name: "Parametric.Online",
  shortName: "P.O",
  origin: process.env.NEXT_PUBLIC_SITE_URL ?? "https://parametric.online",
  accent: process.env.NEXT_PUBLIC_ACCENT_COLOR ?? "#ff4d00",
  youtubeUrl:
    process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@Parametric",
  skoolUrl:
    process.env.NEXT_PUBLIC_SKOOL_URL ?? "https://www.skool.com/parametric-lab",
  calendlyUrl:
    process.env.NEXT_PUBLIC_CALENDLY_URL ??
    "https://calendly.com/parametric-online",
  newsletterAction:
    process.env.NEXT_PUBLIC_NEWSLETTER_URL ?? "https://buttondown.com/parametriconline",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@parametric.online",
};

export const sessions = [
  {
    title: "Workflow Diagnostic",
    duration: "45 min",
    price: process.env.NEXT_PUBLIC_SESSION_DIAGNOSTIC_PRICE ?? "$145",
    description:
      "A focused review of one Grasshopper, ComfyUI, or hybrid workflow. Leave with a prioritized repair plan.",
    bestFor: "Blocked workflows and technical decisions",
    bookingUrl:
      process.env.NEXT_PUBLIC_SESSION_DIAGNOSTIC_URL ?? siteConfig.calendlyUrl,
  },
  {
    title: "Project & Script Clinic",
    duration: "90 min",
    price: process.env.NEXT_PUBLIC_SESSION_CLINIC_PRICE ?? "$285",
    description:
      "Pair on a live project, refactor a definition, or establish a reliable system for the next phase.",
    bestFor: "Active projects that need hands-on support",
    bookingUrl:
      process.env.NEXT_PUBLIC_SESSION_CLINIC_URL ?? siteConfig.calendlyUrl,
  },
  {
    title: "Working Intensive",
    duration: "3 hours",
    price: process.env.NEXT_PUBLIC_SESSION_INTENSIVE_PRICE ?? "$560",
    description:
      "A concentrated working session for complex models, automation strategy, or team workflow design.",
    bestFor: "Complex systems and high-leverage progress",
    bookingUrl:
      process.env.NEXT_PUBLIC_SESSION_INTENSIVE_URL ?? siteConfig.calendlyUrl,
  },
] as const;

export const navItems = [
  { href: "/tools", label: "Tools" },
  { href: "/learn", label: "Learn" },
  { href: "/sessions", label: "Sessions" },
  { href: "/lab", label: "Lab" },
  { href: "/about", label: "About" },
] as const;

