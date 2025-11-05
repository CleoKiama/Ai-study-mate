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
    const isLoggedIn = Boolean(session?.session);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto">
                <LandingHero isLoggedIn={isLoggedIn} />
                <FeatureGrid />
                <AboutCards />
                <HowItWorks />
                <Testimonials />
                <CTASection />
            </div>
        </div>
    );
}
