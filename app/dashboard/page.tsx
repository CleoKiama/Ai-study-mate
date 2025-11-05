import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  mockDocuments,
  mockSummaries,
  mockQuizzes,
  mockProgress,
} from "@/lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
  const recentDocument = mockDocuments[0];
  const recentSummary = mockSummaries[0];
  const recentQuiz = mockQuizzes[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your studies today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <span className="text-2xl">📚</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDocuments.length}</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Summaries Created
            </CardTitle>
            <span className="text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSummaries.length}</div>
            <p className="text-xs text-muted-foreground">
              All documents summarized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Average</CardTitle>
            <span className="text-2xl">🎯</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProgress.averageScore}%
            </div>
            <p className="text-xs text-muted-foreground">+2% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProgress.streakDays} days
            </div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentDocument && (
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                    📁
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Uploaded &quot;{recentDocument.name}&quot;
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {recentDocument.uploadDate}
                    </p>
                  </div>
                </div>
              )}

              {recentSummary && (
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-accent/10 rounded-full flex items-center justify-center">
                    📝
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Generated summary for &quot;{recentSummary.documentTitle}
                      &quot;
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {recentSummary.createdAt}
                    </p>
                  </div>
                </div>
              )}

              {recentQuiz && (
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-secondary/10 rounded-full flex items-center justify-center">
                    🧠
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Completed &quot;{recentQuiz.title}&quot; -{" "}
                      {recentQuiz.bestScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {recentQuiz.lastAttempt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/dashboard/upload">Upload Document</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/chat">Chat with Docs</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/summaries">View Summaries</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/quizzes">Take Quiz</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
