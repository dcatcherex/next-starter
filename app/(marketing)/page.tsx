import Link from "next/link";
import { Show } from "@clerk/nextjs";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between p-4">
        <span className="font-semibold">Next Starter</span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Next Starter</h1>
        <p className="max-w-md text-muted-foreground">
          Next.js, Clerk, Drizzle + Neon and shadcn/ui (Base UI), ready to build
          on.
        </p>
        <div className="flex gap-3">
          <Show when="signed-out">
            <Button render={<Link href="/sign-in" />} nativeButton={false}>
              Sign in
            </Button>
          </Show>
          <Show when="signed-in">
            <Button render={<Link href="/dashboard" />} nativeButton={false}>
              Go to app
            </Button>
          </Show>
        </div>
      </main>
    </div>
  );
}
