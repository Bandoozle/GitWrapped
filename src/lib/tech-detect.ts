const KNOWN = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Vue",
  "Svelte",
  "Node",
  "Express",
  "Supabase",
  "PostgreSQL",
  "Tailwind",
  "Framer Motion",
  "Python",
  "Go",
  "Rust",
  "Docker",
  "Prisma",
  "GraphQL",
  "Firebase",
  "Swift",
  "Kotlin",
] as const;

export function detectTechnologies(
  languages: string[],
  description?: string | null,
): string[] {
  const text = `${languages.join(" ")} ${description ?? ""}`.toLowerCase();
  const found = new Set<string>();

  for (const lang of languages) {
    if (lang === "TSX" || lang === "TypeScript") found.add("TypeScript");
    else if (lang === "JavaScript" || lang === "JSX") found.add("JavaScript");
    else if (KNOWN.includes(lang as (typeof KNOWN)[number])) found.add(lang);
    else found.add(lang);
  }

  const hints: [RegExp, string][] = [
    [/next\.?js|nextjs/, "Next.js"],
    [/react/, "React"],
    [/tailwind/, "Tailwind"],
    [/supabase/, "Supabase"],
    [/framer/, "Framer Motion"],
    [/node/, "Node"],
    [/prisma/, "Prisma"],
    [/graphql/, "GraphQL"],
    [/firebase/, "Firebase"],
    [/docker/, "Docker"],
  ];

  for (const [re, label] of hints) {
    if (re.test(text)) found.add(label);
  }

  return [...found].slice(0, 8);
}
