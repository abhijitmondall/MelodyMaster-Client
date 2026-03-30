import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import AboutUs from "@/components/home/AboutUs";
import PopularClasses from "@/components/home/PopularClasses";
import PopularInstructors from "@/components/home/PopularInstructors";
import Testimonials from "@/components/home/Testimonials";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutUs />
      <PopularClasses />
      <PopularInstructors />
      <Testimonials />
    </>
  );
}
