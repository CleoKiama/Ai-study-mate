import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "@/utils/session.server";
import { logoutAction } from "./actions";

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6 mb-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                StudyMate
              </h1>
              <p className="text-xl text-muted-foreground">
                Welcome back! Ready to continue your learning journey?
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">📚 Upload Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your study materials and get AI-generated summaries
                </p>
                <Button asChild className="w-full">
                  <Link href="/dashboard/upload">Upload Now</Link>
                </Button>
              </div>

              <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">📝 View Summaries</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review AI-generated summaries of your documents
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/summaries">View Summaries</Link>
                </Button>
              </div>

              <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">🧠 Take Quizzes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Test your knowledge with interactive quizzes
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/quizzes">Start Quiz</Link>
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StudyMate
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered study assistant. Upload documents, get instant summaries, 
              and test your knowledge with interactive quizzes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 my-16">
            <div className="space-y-4">
              <div className="text-4xl">📚</div>
              <h3 className="text-lg font-semibold">Smart Summaries</h3>
              <p className="text-sm text-muted-foreground">
                Upload your study materials and get AI-generated summaries in seconds
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl">🧠</div>
              <h3 className="text-lg font-semibold">Interactive Quizzes</h3>
              <p className="text-sm text-muted-foreground">
                Test your understanding with personalized quizzes based on your content
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl">📊</div>
              <h3 className="text-lg font-semibold">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your learning progress and identify areas for improvement
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Start your learning journey today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
