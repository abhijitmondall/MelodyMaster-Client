import Link from "next/link";
import {
  Music,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200">
      <div className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Music className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                MelodyMasters
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Unlock musical potential with curated courses and experts.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                ["Home", "/"],
                ["Classes", "/classes"],
                ["Instructors", "/instructors"],
                ["Dashboard", "/dashboard"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm hover:text-white transition-colors hover:translate-x-0.5 inline-flex"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Popular Courses
            </h4>
            <ul className="space-y-2.5">
              {[
                "Guitar Masterclass",
                "Piano for Beginners",
                "Vocal Training",
                "Drum Basics",
                "Music Theory",
              ].map((c) => (
                <li key={c}>
                  <Link
                    href="/classes"
                    className="text-sm hover:text-white transition-colors"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>123 Melody Lane, Music City, MC 45678</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>hello@melodymasters.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} MelodyMasters. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {item}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
