"use client";

import AutoScroll from "embla-carousel-auto-scroll";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface Logo {
  id: string;
  description: string;
  image: string;
  name: string;
}

interface Logos3Props {
  heading?: string;
  logos?: Logo[];
  className?: string;
  theme?: "light" | "dark";
}

const defaultLogos: Logo[] = [
  {
    id: "logo-1",
    description: "React 18 Framework",
    name: "React 18",
    image: "https://cdn.simpleicons.org/react/61DAFB",
  },
  {
    id: "logo-2",
    description: "TypeScript Language",
    name: "TypeScript",
    image: "https://cdn.simpleicons.org/typescript/3178C6",
  },
  {
    id: "logo-3",
    description: "Tailwind CSS Styling",
    name: "Tailwind CSS",
    image: "https://cdn.simpleicons.org/tailwindcss/06B6D4",
  },
  {
    id: "logo-4",
    description: "Node.js Runtime",
    name: "Node.js",
    image: "https://cdn.simpleicons.org/nodedotjs/5FA04E",
  },
  {
    id: "logo-5",
    description: "Express.js REST API",
    name: "Express.js",
    image: "https://cdn.simpleicons.org/express/666666",
  },
  {
    id: "logo-6",
    description: "MongoDB Database",
    name: "MongoDB",
    image: "https://cdn.simpleicons.org/mongodb/47A248",
  },
  {
    id: "logo-7",
    description: "Vite Bundler",
    name: "Vite",
    image: "https://cdn.simpleicons.org/vite/646CFF",
  },
  {
    id: "logo-8",
    description: "Framer Motion",
    name: "Framer Motion",
    image: "https://cdn.simpleicons.org/framer/0055FF",
  },
];

const Logos3 = ({
  heading = "Powered by Modern Tech Stack",
  logos = defaultLogos,
  className = "",
  theme = "dark",
}: Logos3Props) => {
  const isDark = theme === "dark";

  return (
    <section className={`py-10 md:py-14 relative z-10 ${className}`}>
      <div className="container mx-auto flex flex-col items-center text-center px-4">
        <h2 className="my-3 text-lg font-bold tracking-tight lg:text-2xl gradient-text">
          {heading}
        </h2>
      </div>
      <div className="pt-4 md:pt-6">
        <div className="relative mx-auto flex items-center justify-center max-w-6xl overflow-hidden">
          <Carousel
            opts={{ loop: true }}
            plugins={[
              AutoScroll({
                playOnInit: true,
                speed: 1,
                stopOnInteraction: false,
                stopOnMouseEnter: false,
                stopOnFocusIn: false,
              }),
            ]}
            className="w-full pointer-events-none"
          >
            <CarouselContent className="-ml-2">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="pl-2 basis-auto shrink-0"
                >
                  <div className="px-3 py-1">
                    <div
                      className={`px-5 py-3 rounded-2xl border flex items-center gap-3 shrink-0 min-w-[160px] shadow-lg backdrop-blur-md transition-all duration-200 ${
                        isDark
                          ? "bg-zinc-900/85 border-zinc-800/90 shadow-black/40 text-zinc-100"
                          : "bg-white/90 border-[#e5e2d9] shadow-zinc-200/50 text-zinc-900"
                      }`}
                    >
                      <img
                        src={logo.image}
                        alt={logo.description}
                        className="w-6 h-6 object-contain shrink-0"
                        loading="eager"
                      />
                      <span className="text-xs font-bold tracking-tight whitespace-nowrap">
                        {logo.name}
                      </span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Side gradient fade masks matching active theme */}
          <div
            className={`absolute inset-y-0 left-0 w-24 bg-gradient-to-r pointer-events-none z-10 ${
              isDark ? "from-zinc-950 to-transparent" : "from-[#fbfaf7] to-transparent"
            }`}
          />
          <div
            className={`absolute inset-y-0 right-0 w-24 bg-gradient-to-l pointer-events-none z-10 ${
              isDark ? "from-zinc-950 to-transparent" : "from-[#fbfaf7] to-transparent"
            }`}
          />
        </div>
      </div>
    </section>
  );
};

export { Logos3 };
