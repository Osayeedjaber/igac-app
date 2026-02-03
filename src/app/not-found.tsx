import Link from "next/link";
import { Button } from "@/components/ui/button-premium";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-primary/20 blur-[120px] filter" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[50vw] w-[50vw] rounded-full bg-blue-500/20 blur-[120px] filter" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        <h1 className="text-9xl font-black tracking-tighter text-foreground opacity-10 sm:text-[12rem]">
          404
        </h1>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
            Page Not Found
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          <Link href="/">
            <Button size="lg" className="rounded-full px-8">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
