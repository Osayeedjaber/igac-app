import Link from "next/link";
import { Button } from "@/components/ui/button-premium";
import { Meteors } from "@/components/ui/meteors";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-16 text-center relative overflow-hidden selection:bg-primary/30">
      {/* Background atmosphere — matching site theme */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Meteors number={15} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="relative w-20 h-20 mb-10 opacity-30">
          <Image src="/logo.png" alt="IGAC" fill className="object-contain" />
        </div>

        {/* Large 404 */}
        <h1 className="text-[10rem] sm:text-[14rem] font-serif font-black tracking-tighter text-foreground/[0.04] leading-none select-none mb-[-3rem]">
          404
        </h1>

        <div className="flex flex-col items-center gap-6">
          <span className="text-primary text-[10px] font-black uppercase tracking-[0.5em] block">
            Lost in Diplomacy
          </span>

          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground tracking-tight">
            Page Not Found
          </h2>

          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-md font-light">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="magic" withArrow>
                Return Home
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="shimmer">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
