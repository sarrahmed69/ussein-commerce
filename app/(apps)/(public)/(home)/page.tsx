"use client";
import Hero from "@/screens/home/widgets/Hero";
import StoriesBar from "@/components/stories/StoriesBar";
import NewsLetter from "@/screens/home/widgets/NewsLetter";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <StoriesBar />
      <NewsLetter />
    </main>
  );
}