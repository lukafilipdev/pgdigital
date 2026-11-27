import { CustomCursor } from "@/components/effects/CustomCursor";
import { SmoothScroll } from "@/components/effects/SmoothScroll";
import { IntroProvider } from "@/components/intro/IntroProvider";
import { Loader } from "@/components/intro/Loader";
import { Header } from "@/components/layout/Header";
import { Contact } from "@/components/sections/contact/Contact";
import { Hero } from "@/components/sections/hero/Hero";
import { OriginStage } from "@/components/sections/hero/OriginStage";
import { Process } from "@/components/sections/process/Process";
import { Projects } from "@/components/sections/projects/Projects";
import { Services } from "@/components/sections/services/Services";

export default function HomePage() {
  return (
    <IntroProvider>
      <SmoothScroll />
      <Loader />
      <CustomCursor />
      <Header />
      <main>
        <Hero />
        <OriginStage />
        <Services />
        <Projects />
        <Process />
        <Contact />
      </main>
    </IntroProvider>
  );
}
