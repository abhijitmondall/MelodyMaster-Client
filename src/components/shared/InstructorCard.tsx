import Image from "next/image";
import { BookOpen, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";

export default function InstructorCard({ instructor }: { instructor: User }) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
      <CardContent className="p-8 space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
              {instructor.photo && <AvatarImage src={instructor.photo} alt={instructor.name} />}
              <AvatarFallback className="text-2xl font-black">{getInitials(instructor.name)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary border-2 border-background flex items-center justify-center">
              <span className="text-[8px] font-black text-primary-foreground">PRO</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg">{instructor.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{instructor.email}</p>
        </div>

        <div className="flex justify-center gap-6 pt-2 border-t border-border">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center text-primary">
              <BookOpen className="h-4 w-4" />
              <span className="font-black text-lg">{instructor.classes}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Classes</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center text-primary">
              <Users className="h-4 w-4" />
              <span className="font-black text-lg">{instructor.students}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Students</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
