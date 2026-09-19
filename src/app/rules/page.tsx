import { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  Lock,
  UserCheck,
  CreditCard,
  AlertTriangle,
  Info,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "নিয়মাবলী ও ব্যবহারবিধি (Rules & Policy)",
  description: "বইঘর প্ল্যাটফর্ম ব্যবহারের সহজ নীতিমালা ও দিকনির্দেশনা",
};

export default function RulesPage() {
  const rules = [
    {
      icon: BookOpen,
      title: "১. ব্যক্তিগত ব্যবহার",
      description:
        "এই প্ল্যাটফর্মের সকল ডিজিটাল বই শুধুমাত্র আপনার ব্যক্তিগত জ্ঞানার্জন ও পড়ার জন্য সংরক্ষিত। কোনো বাণিজ্যিক বা অননুমোদিত কাজে এটি ব্যবহার করা যাবে না।",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Lock,
      title: "২. অননুমোদিত ডাউনলোড ও বিতরণ সম্পূর্ণ নিষিদ্ধ",
      description:
        "অনুমতি ছাড়া কোনো বই বা এর অংশবিশেষ ডাউনলোড, কপি, পাইরেসি, স্ক্রিন ক্যাপচার ছড়ানো বা অন্য কোনো মাধ্যমে শেয়ার/বিতরণ করা সম্পূর্ণ নিষিদ্ধ এবং আইনত দণ্ডনীয়।",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      icon: UserCheck,
      title: "৩. একাউন্ট শেয়ার না করা",
      description:
        "আপনার একাউন্টের লগইন তথ্য একান্তই আপনার নিজস্ব। একই একাউন্ট একাধিক ব্যক্তির সাথে শেয়ার করা প্ল্যাটফর্মের নিরাপত্তা নীতির পরিপন্থী।",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: CreditCard,
      title: "৪. এক্সেস অ্যাক্টিভেশন",
      description:
        "বইটির ডিজিটাল সংস্করণ পড়তে সরাসরি আমাদের ফেসবুক মেসেঞ্জারে যোগাযোগ করুন। এডমিন আপনার একাউন্টে রিডার এক্সেস সক্রিয় (Active) করে দেবেন।",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      icon: AlertTriangle,
      title: "৫. এক্সেস স্থগিতকরণ (Access Revocation)",
      description:
        "প্ল্যাটফর্মের নিরাপত্তা বা ব্যবহারের নিয়ম লঙ্ঘিত হলে বা সন্দেহজনক কার্যকলাপ পরিলক্ষিত হলে কর্তৃপক্ষ যে কোনো সময় রিডার এক্সেস স্থগিত বা বাতিল করার অধিকার সংরক্ষণ করে।",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: Info,
      title: "৬. শিক্ষণীয় ও তথ্যমূলক উদ্দেশ্য (Disclaimer)",
      description:
        "প্ল্যাটফর্মে প্রকাশিত বইসমূহ প্রধানত শিক্ষণীয় ও জ্ঞান অর্জনের জন্য প্রণীত। যেকোনো চিকিৎসাজনিত বা বাস্তবিক সিদ্ধান্ত গ্রহণে বিশেষজ্ঞ বা রেজিস্টার্ড চিকিৎসকের সরাসরি পরামর্শ গ্রহণ অপরিহার্য।",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>ব্যবহারবিধি ও নীতিমালা</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              {siteConfig.nameBn}-এ সুরক্ষিত ও স্বাচ্ছন্দ্যময় পাঠের অভিজ্ঞতা নিশ্চিত করতে অনুগ্রহ করে নিচের সাধারণ নিয়মগুলো মেনে চলুন।
            </p>
          </div>

          {/* Rules Cards */}
          <div className="space-y-4">
            {rules.map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <Card key={idx} className="glass-card hover:border-primary/40 transition-all">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-xl ${rule.bg} ${rule.color} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-foreground">
                        {rule.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {rule.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Help / Contact Banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-semibold text-foreground">
                  কোনো জিজ্ঞাসা বা সহায়তার প্রয়োজন?
                </h3>
                <p className="text-xs text-muted-foreground">
                  আমাদের মেসেঞ্জারে বার্তা পাঠিয়ে সরাসরি সহায়তা গ্রহণ করুন।
                </p>
              </div>
              <a
                href={siteConfig.links.messengerContact}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  মেসেঞ্জারে যোগাযোগ করুন
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Return button */}
          <div className="text-center pt-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <ArrowLeft className="h-4 w-4" />
                মূল পাতায় ফিরে যান
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
