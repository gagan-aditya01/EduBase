interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio?: string;
}

interface TeamSectionProps {
  heading?: string;
  subheading?: string;
  members?: TeamMember[];
  theme?: "light" | "dark";
}

const defaultMembers: TeamMember[] = [
  {
    name: "Yashwanth",
    role: "Lead Architect",
    avatar: "/Teams/member1.jpg",
    bio: "Full-stack development, database schema architecture & API design.",
  },
  {
    name: "Gagan Aditya",
    role: "UI/UX Engineer",
    avatar: "/Teams/member2.jpg",
    bio: "Frontend design system, interactive visual effects & animation engineering.",
  },
];

export default function TeamSection({
  heading = "Our Team",
  subheading = "Equal partnership driving technical excellence and full-stack innovation.",
  members = defaultMembers,
  theme = "dark",
}: TeamSectionProps) {
  const isDark = theme === "dark";

  return (
    <section className="py-12 md:py-20 relative z-10 border-t border-zinc-850/10 dark:border-zinc-850/40">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-4xl gradient-text">
            {heading}
          </h2>
          <p className="mt-2 text-xs md:text-sm text-zinc-500 max-w-md">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {members.map((member, index) => (
            <div
              key={index}
              className={`p-6 rounded-[32px] border flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] shadow-xl backdrop-blur-md ${
                isDark
                  ? "bg-zinc-900/75 border-zinc-800/90 text-zinc-100 shadow-black/40"
                  : "bg-white/90 border-[#e5e2d9] text-zinc-900 shadow-zinc-200/50"
              }`}
            >
              <div className={`size-32 rounded-full border-2 p-1 shadow-xl overflow-hidden mb-4 relative ${
                isDark ? "border-zinc-700 bg-zinc-950" : "border-[#cc5a37]/30 bg-white"
              }`}>
                <img
                  className="aspect-square w-full h-full rounded-full object-cover"
                  src={member.avatar}
                  alt={member.name}
                  loading="lazy"
                />
              </div>
              <h3 className="text-base font-bold tracking-tight">{member.name}</h3>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full border mt-2 mb-2.5 bg-[#cc5a37]/10 border-[#cc5a37]/30 text-[#cc5a37]">
                {member.role}
              </span>
              {member.bio && (
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                  {member.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
