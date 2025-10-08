"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import type { UserFile, UserQuiz, QuizStats } from "../page";
import { createQuizAction } from "../utils/quiz-server";
import Link from "next/link";

export const QuizClient = ({ 
  files, 
  quizzes, 
  stats 
}: { 
  files: UserFile[]; 
  quizzes: UserQuiz[]; 
  stats: QuizStats; 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewQuizDialog, setShowNewQuizDialog] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Form state
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles((prev) => [...prev, fileId]);
    } else {
      setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
    }
  };

  const handleGenerateQuiz = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await createQuizAction({
        externalFileIds: selectedFiles,
        topic: topic.trim() || undefined,
        count: questionCount,
        difficulty,
      });
    } catch (err) {
      setError("An unexpected error occurred.Please try again");
      console.error("Quiz generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge with AI-generated quizzes
          </p>
        </div>
        <Dialog open={showNewQuizDialog} onOpenChange={setShowNewQuizDialog}>
          <DialogTrigger asChild>
            <Button disabled={files.length === 0}>Create New Quiz</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Documents ({files.length} available)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                  {files.map((file) => (
                    <div
                      key={file.fileId}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={file.fileId}
                        checked={selectedFiles.includes(file.externalFileId)}
                        onCheckedChange={(checked) =>
                          handleFileSelection(file.externalFileId, !!checked)
                        }
                      />
                      <label
                        htmlFor={file.fileId}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {file.fileName || `File ${file.fileId}`}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Topic (optional)
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Machine Learning Basics"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Number of Questions
                </label>
                <Input
                  type="number"
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      Math.max(1, Math.min(20, parseInt(e.target.value) || 1)),
                    )
                  }
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Difficulty
                </label>
                <div className="flex space-x-2">
                  {(["easy", "medium", "hard"] as const).map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDifficulty(level)}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewQuizDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating || selectedFiles.length === 0}
                >
                  {isGenerating ? "Generating..." : "Generate Quiz"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your Quiz</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {quizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{quiz.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {quiz.createdAt.toLocaleDateString()} • {quiz.attempts} attempts
                      {quiz.attempts > 0 && ` • Best score: ${quiz.score}%`}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/quizzes/${quiz.id}`}>
                      Take Quiz
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {files.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-4xl text-muted-foreground">🧠</div>
              <div>
                <h3 className="text-lg font-medium">No documents available</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload documents to start creating quizzes
                </p>
              </div>
              <Button asChild variant={"link"}>
                <Link href="/dashboard/upload">Upload Document</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-4xl text-muted-foreground">🧠</div>
              <div>
                <h3 className="text-lg font-medium">Ready to create quizzes</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  You have {files.length} processed documents available for quiz
                  generation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Quiz Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{files.length}</div>
              <p className="text-sm text-muted-foreground">
                Available Documents
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.quizzesCount}</div>
              <p className="text-sm text-muted-foreground">Quizzes Created</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.avgScore}</div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalAttempts}</div>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
