const optionalUrl = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

export const siteConfig = {
  name: "Parametric Online",
  shortName: "P / O",
  origin: process.env.NEXT_PUBLIC_SITE_URL ?? "https://parametric.online",
  accent: process.env.NEXT_PUBLIC_ACCENT_COLOR ?? "#c91836",
  youtubeUrl:
    process.env.NEXT_PUBLIC_YOUTUBE_URL ??
    "https://www.youtube.com/channel/UCHGjWx-r-g_scgX-kIQc5sw",
  portfolioUrl:
    process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "https://www.sabrigokmen.com",
  discordUrl:
    process.env.NEXT_PUBLIC_DISCORD_URL ?? "https://discord.gg/XdKRyBajp",
  bookingUrl: optionalUrl(process.env.NEXT_PUBLIC_BOOKING_URL),
  consultancyUrl: optionalUrl(process.env.NEXT_PUBLIC_CONSULTANCY_URL),
  supportUrl: optionalUrl(process.env.NEXT_PUBLIC_SUPPORT_URL),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null,
};

export const navItems = [
  { href: siteConfig.youtubeUrl, label: "Learn", external: true },
  { href: "/scripts", label: "Marketplace", external: false },
  {
    href: siteConfig.discordUrl,
    label: "Community",
    external: true,
  },
  { href: "/expert-help", label: "Work Together", external: false },
] as const;
