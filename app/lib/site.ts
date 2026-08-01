const optionalUrl = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

export const siteConfig = {
  name: "Parametric Online",
  shortName: "P / O",
  origin: process.env.NEXT_PUBLIC_SITE_URL ?? "https://parametric.online",
  accent: process.env.NEXT_PUBLIC_ACCENT_COLOR ?? "#315cff",
  youtubeUrl:
    process.env.NEXT_PUBLIC_YOUTUBE_URL ??
    "https://www.youtube.com/channel/UCHGjWx-r-g_scgX-kIQc5sw",
  portfolioUrl:
    process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "https://www.sabrigokmen.com",
  discordUrl: optionalUrl(process.env.NEXT_PUBLIC_DISCORD_URL),
  bookingUrl: optionalUrl(process.env.NEXT_PUBLIC_BOOKING_URL),
  consultancyUrl: optionalUrl(process.env.NEXT_PUBLIC_CONSULTANCY_URL),
  supportUrl: optionalUrl(process.env.NEXT_PUBLIC_SUPPORT_URL),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null,
};

export const navItems = [
  { href: "/learn", label: "Learn" },
  { href: "/scripts", label: "Scripts" },
  { href: "/community", label: "Community" },
  { href: "/expert-help", label: "Expert Help" },
  { href: "/about", label: "About" },
] as const;
