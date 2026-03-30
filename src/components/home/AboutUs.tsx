import { CheckCircle2, Music, Target, Heart } from "lucide-react";
import SectionTitle from "@/components/shared/SectionTitle";

const features = [
  "Expert instructors with 10+ years experience",
  "Flexible scheduling to fit your lifestyle",
  "Personalised learning paths for every level",
  "Vibrant community of passionate musicians",
  "Certified curriculum with measurable milestones",
  "Live feedback and one-on-one sessions available",
];

const values = [
  { icon: Music, title: "Passion-First", desc: "Music is more than notes — it is emotion, culture, and expression." },
  { icon: Target, title: "Goal-Oriented", desc: "Clear milestones so you always know where you are heading." },
  { icon: Heart, title: "Community-Driven", desc: "A supportive environment where every student thrives together." },
];

export default function AboutUs() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <SectionTitle
              align="left"
              tag="About Us"
              title="Why Choose MelodyMasters?"
              subtitle="We believe everyone deserves access to quality music education. Our platform connects passionate learners with world-class instructors."
            />

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right */}
          <div className="grid grid-cols-1 gap-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-2xl border bg-card hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
