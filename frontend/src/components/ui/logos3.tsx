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
  className?: string;
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
    description: "React 18",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/react-wordmark.svg",
    className: "h-6 w-auto",
  },
  {
    id: "logo-2",
    description: "Tailwind CSS",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-wordmark.svg",
    className: "h-4 w-auto",
  },
  {
    id: "logo-3",
    description: "Next.js / Node.js",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/nextjs-wordmark.svg",
    className: "h-6 w-auto dark:invert",
  },
  {
    id: "logo-4",
    description: "Figma Design",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/figma-wordmark.svg",
    className: "h-6 w-auto",
  },
  {
    id: "logo-5",
    description: "shadcn/ui",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcn-ui-wordmark.svg",
    className: "h-6 w-auto dark:invert",
  },
  {
    id: "logo-6",
    description: "Supabase / Database",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/supabase-wordmark.svg",
    className: "h-6 w-auto",
  },
  {
    id: "logo-7",
    description: "Vercel / Deployment",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/vercel-wordmark.svg",
    className: "h-6 w-auto dark:invert",
  },
  {
    id: "logo-8",
    description: "Astro",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/astro-wordmark.svg",
    className: "h-6 w-auto dark:invert",
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
        <h2 className={`my-3 text-lg font-bold tracking-tight lg:text-2xl gradient-text`}>
          {heading}
        </h2>
      </div>
      <div className="pt-4 md:pt-6">
        <div className="relative mx-auto flex items-center justify-center max-w-6xl overflow-hidden">
          <Carousel
            opts={{ loop: true }}
            plugins={[AutoScroll({ playOnInit: true, speed: 0.8 })]}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="pl-2 basis-auto shrink-0"
                >
                  <div className="px-3 py-1">
                    <div className={`px-6 py-3.5 rounded-2xl border flex items-center justify-center shrink-0 min-w-[170px] shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 ${
                      isDark
                        ? "bg-zinc-900/85 border-zinc-800/90 shadow-black/40 text-zinc-100"
                        : "bg-white/90 border-[#e5e2d9] shadow-zinc-200/50 text-zinc-900"
                    }`}>
                      <img
                        src={logo.image}
                        alt={logo.description}
                        className={`${logo.className} object-contain max-h-7`}
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Side gradient fade masks matching active theme */}
          <div className={`absolute inset-y-0 left-0 w-24 bg-gradient-to-r pointer-events-none z-10 ${
            isDark ? "from-zinc-950 to-transparent" : "from-[#fbfaf7] to-transparent"
          }`} />
          <div className={`absolute inset-y-0 right-0 w-24 bg-gradient-to-l pointer-events-none z-10 ${
            isDark ? "from-zinc-950 to-transparent" : "from-[#fbfaf7] to-transparent"
          }`} />
        </div>
      </div>
    </section>
  );
};

export { Logos3 };
