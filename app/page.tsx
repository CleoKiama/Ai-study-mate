import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/utils/session.server";
import { logoutAction } from "./actions";
import { LandingHero } from "@/components/landing/hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { AboutCards } from "@/components/landing/about-cards";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { CTASection } from "@/components/landing/cta";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function Home() {
  const session = await getServerSession();

  // if (session) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
  //       <div className="container mx-auto px-4 py-12">
  //         <div className="mx-auto max-w-5xl">
  //           <div className="text-center space-y-4 mb-10">
  //             <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
  //               Welcome back to StudyMate
  //             </h1>
  //             <p className="text-muted-foreground">
  //               Pick up where you left off or explore something new.
  //             </p>
  //           </div>
  //
  //           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
  //             <Card className="transition-transform hover:-translate-y-1">
  //               <CardHeader>
  //                 <CardTitle>📚 Upload Documents</CardTitle>
  //                 <CardDescription>Get AI-generated summaries in seconds</CardDescription>
  //               </CardHeader>
  //               <CardContent>
  //                 <Button asChild className="w-full">
  //                   <Link href="/dashboard/upload">Upload Now</Link>
  //                 </Button>
  //               </CardContent>
  //             </Card>
  //
  //             <Card className="transition-transform hover:-translate-y-1">
  //               <CardHeader>
  //                 <CardTitle>📝 View Summaries</CardTitle>
  //                 <CardDescription>Review and refine your understanding</CardDescription>
  //               </CardHeader>
  //               <CardContent>
  //                 <Button asChild variant="outline" className="w-full">
  //                   <Link href="/dashboard/summaries">View Summaries</Link>
  //                 </Button>
  //               </CardContent>
  //             </Card>
  //
  //             <Card className="transition-transform hover:-translate-y-1">
  //               <CardHeader>
  //                 <CardTitle>🧠 Take Quizzes</CardTitle>
  //                 <CardDescription>Practice with adaptive questions</CardDescription>
  //               </CardHeader>
  //               <CardContent>
  //                 <Button asChild variant="outline" className="w-full">
  //                   <Link href="/dashboard/quizzes">Start Quiz</Link>
  //                 </Button>
  //               </CardContent>
  //             </Card>
  //           </div>
  //
  //           <div className="flex items-center justify-between">
  //             <Button asChild>
  //               <Link href="/dashboard">Go to Dashboard</Link>
  //             </Button>
  //             <form action={logoutAction}>
  //               <Button type="submit" variant="ghost">
  //                 Logout
  //               </Button>
  //             </form>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto">
        <LandingHero />
        <FeatureGrid />
        <AboutCards />
        <HowItWorks />
        <Testimonials />
        <CTASection />
      </div>
    </div>
  );
}
