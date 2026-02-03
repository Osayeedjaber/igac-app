import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Community } from "@/components/sections/community";
import { PresidentMessage } from "@/components/sections/president-message";
import { InfiniteCarousel } from "@/components/motion/infinite-carousel";
import { Reveal } from "@/components/motion/reveal";
import { GoverningBodyHome } from "@/components/sections/governing-body-home";
import { RegionalPresence } from "@/components/sections/regional-presence";
import { Impact } from "@/components/sections/impact";
import { EventsPreview } from "@/components/sections/events-preview";
import ScrollVelocity from "@/components/ScrollVelocity";
import Link from "next/link";
import { ArrowRight, Award, Globe, MessageSquare, Users } from "lucide-react";
import { Meteors } from "@/components/ui/meteors";
import { Button } from "@/components/ui/button-premium";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IGAC | International Global Affairs Council",
  description: "The biggest Model United Nations conference in South East Asia. Empowering the next generation of leaders through diplomacy and negotiation.",
  openGraph: {
    title: "IGAC | International Global Affairs Council",
    description: "The biggest Model United Nations conference in South East Asia. Join us in shaping tomorrow's leaders.",
    url: "https://igac.org",
    siteName: "IGAC",
    images: [
      {
        url: "/past-events/igacmuns2bannerjpg.jpg",
        width: 1200,
        height: 630,
        alt: "IGAC Conference Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IGAC | International Global Affairs Council",
    description: "The biggest Model United Nations conference in South East Asia.",
    images: ["/past-events/igacmuns2bannerjpg.jpg"],
  },
};

const whyJoinReasons = [
  {
    icon: Globe,
    title: "Global Exposure",
    description: "Connect with delegates from 15+ countries and gain international perspectives on global issues."
  },
  {
    icon: Award,
    title: "Skill Development",
    description: "Master public speaking, negotiation, and critical thinking through hands-on diplomatic simulations."
  },
  {
    icon: MessageSquare,
    title: "Leadership Training",
    description: "Develop leadership qualities through committee roles, crisis management, and team collaboration."
  },
  {
    icon: Users,
    title: "Networking",
    description: "Build lasting connections with future diplomats, policy makers, and change-makers worldwide."
  }
];

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <About />
      <Community />
      <PresidentMessage />
      <GoverningBodyHome />
      {/* Core Panel Preview */}
      <section className="py-24 overflow-hidden border-t border-white/5 relative">
        <div className="container mx-auto px-6 mb-16 text-center flex flex-col items-center">
          <Reveal className="flex flex-col items-center w-full">
            <span className="text-primary text-base font-bold tracking-[0.2em] uppercase mb-4 block">Operations</span>
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6">The Core Panel</h2>
            <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto">The dedicated team driving our mission forward.</p>
          </Reveal>
        </div>
        <InfiniteCarousel />
      </section>

      <RegionalPresence />

      <Impact />

      {/* Why Join IGAC */}
      <section className="py-24 border-y border-white/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 flex flex-col items-center">
            <Reveal className="flex flex-col items-center w-full text-center">
              <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 block">Benefits</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">Why Join IGAC?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">
                Discover how IGAC can transform your journey into becoming a global leader.
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {whyJoinReasons.map((reason, index) => (
              <Reveal key={reason.title} delay={index * 0.1} className="h-full">
                <div className="group p-8 bg-background/50 rounded-xl border border-white/5 hover:border-primary/30 transition-all duration-500 h-full flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <reason.icon className="w-7 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {reason.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values Marquee */}
      <section className="py-16 border-y border-white/5 overflow-hidden">
        <ScrollVelocity
          texts={["DIPLOMACY • LEADERSHIP • ACTION • ", "VISION • INTEGRITY • EXCELLENCE • "]}
          velocity={50}
          className="text-primary/20 hover:text-primary/40 transition-colors"
        />
      </section>

      <EventsPreview />

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden flex flex-col items-center">
        <Meteors number={30} className="opacity-70" />

        <div className="container mx-auto px-6 text-center relative z-10 flex flex-col items-center">
          <Reveal className="flex flex-col items-center w-full">
            <span className="text-primary text-sm font-bold tracking-[0.3em] uppercase mb-4 block">Get Started</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
              Ready to Shape the Future?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Join South East Asia's premier Model United Nations organization and begin your journey as a global leader.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/join">
                <Button withArrow variant="magic" size="lg">
                  Join Us
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="shimmer" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}
