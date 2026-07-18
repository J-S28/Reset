import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { ScrollStory } from "@/components/landing/ScrollStory";
import { Container } from "@/components/ui/Container";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Nav />
      <main id="main-content" className="flex-1">
        <Hero />
        <ScrollStory />
      </main>
      <footer className="border-t border-white/5 py-8">
        <Container className="flex flex-col items-center justify-between gap-2 text-sm text-foreground-muted sm:flex-row">
          <span>RESET — reset your habits. reclaim your life.</span>
          <span>We don&apos;t fight the addiction. We heal the reason behind it.</span>
        </Container>
      </footer>
    </div>
  );
}
