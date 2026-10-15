import { Hero } from "@/components/Hero";
import { HowItWorks, OmanStats } from "@/components/sections";
import { Wizard } from "@/components/wizard/Wizard";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <OmanStats />
      <Wizard />
    </>
  );
}
