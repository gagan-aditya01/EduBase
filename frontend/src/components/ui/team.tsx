import { motion } from 'framer-motion';

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
    <section className="py-16 md:py-24 relative z-10 overflow-hidden">
      {/* Background ambient glowing blobs matching workspace visual theme */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full filter blur-[120px] ${
            isDark ? 'bg-zinc-800/25 opacity-40' : 'bg-[#e05a47]/30 opacity-20'
          }`}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className={`absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full filter blur-[120px] ${
            isDark ? 'bg-zinc-700/20 opacity-30' : 'bg-amber-400/20 opacity-15'
          }`}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl gradient-text">
            {heading}
          </h2>
          <p className="mt-2.5 text-xs md:text-sm text-zinc-500 max-w-md">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {members.map((member, index) => (
            <div
              key={index}
              className={`p-8 rounded-[40px] border flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl backdrop-blur-3xl relative overflow-hidden group ${
                isDark
                  ? "bg-zinc-950/50 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] text-zinc-100 shadow-black/50"
                  : "bg-white/70 border-[#e5e2d9]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] text-zinc-900 shadow-zinc-200/50"
              }`}
            >
              {/* Avatar with glowing ring (White in dark mode, Gradient in light mode) */}
              <div className={`p-[2.5px] rounded-full shadow-xl mb-5 group-hover:scale-105 transition-transform duration-300 ${
                isDark
                  ? "bg-white border border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  : "bg-gradient-to-tr from-amber-500 via-[#cc5a37] to-[#e05a47]"
              }`}>
                <div className={`size-28 md:size-32 rounded-full overflow-hidden p-0.5 ${
                  isDark ? "bg-zinc-950" : "bg-white"
                }`}>
                  <img
                    className="aspect-square w-full h-full rounded-full object-cover"
                    src={member.avatar}
                    alt={member.name}
                    loading="lazy"
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold tracking-tight">{member.name}</h3>
              <span className="text-[11px] font-bold px-3.5 py-1 rounded-full border mt-2 mb-3 bg-[#cc5a37]/10 border-[#cc5a37]/30 text-[#cc5a37]">
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
