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
import type { UserFile } from "../page";
import { createQuizAction } from "../utils/quiz-server";
import Link from "next/link";

export const QuizClient = ({ files }: { files: UserFile[] }) => {
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
      //INFO: should redirect to the quiz page
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
              {/* File Selection */}
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

              {/* Topic */}
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

              {/* Question Count */}
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

              {/* Difficulty */}
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

      {/* Generated Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your Quiz</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

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
      ) : (
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
      )}

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
              <div className="text-2xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Quizzes Created</p>
            </div>
            <div>
              <div className="text-2xl font-bold">-</div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </div>
            <div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-sm text-muted-foreground">Attempts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
