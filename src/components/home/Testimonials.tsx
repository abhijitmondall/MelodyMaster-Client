import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SectionTitle from "@/components/shared/SectionTitle";
import { getInitials } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Guitar Student",
    rating: 5,
    text: "MelodyMasters completely transformed my guitar playing. The instructors are world-class and the community is incredibly supportive.",
  },
  {
    name: "Marcus Lee",
    role: "Piano Student",
    rating: 5,
    text: "I had zero musical background. Within 3 months, I was playing full pieces. The structured curriculum is absolutely brilliant.",
  },
  {
    name: "Priya Sharma",
    role: "Vocal Student",
    rating: 5,
    text: "The vocal coaching here is phenomenal. My range improved dramatically and I finally have the confidence to perform live.",
  },
  {
    name: "David Kim",
    role: "Drum Student",
    rating: 5,
    text: "Best investment I've ever made. The instructors genuinely care about your progress. Highly recommend to anyone passionate about music.",
  },
  {
    name: "Aisha Okafor",
    role: "Music Theory",
    rating: 5,
    text: "Finally understand music theory in a way that actually makes sense. The explanations are clear, engaging, and practical.",
  },
  {
    name: "Carlos Rivera",
    role: "Bass Guitar",
    rating: 5,
    text: "The community aspect is what sets MelodyMasters apart. You are never learning alone — there is always support and encouragement.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionTitle
          tag="Student Stories"
          title="What Our Students Say"
          subtitle="Real stories from real students who transformed their musical journey with MelodyMasters."
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card
              key={i}
              className="border border-slate-200 bg-white shadow-sm hover-float animate-fade-in"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star
                      key={si}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs font-bold">
                      {getInitials(t.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
