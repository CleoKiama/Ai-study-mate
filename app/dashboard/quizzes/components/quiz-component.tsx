"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { QuizQuestion } from "../utils/quiz-server";
import { recordQuizAttempt } from "../utils/quiz-server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function QuizModal({
  quiz,
  quizId,
}: {
  quiz: QuizQuestion[];
  quizId?: string;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isRecordingAttempt, setIsRecordingAttempt] = useState(false);

  const questions = quiz;
  const totalQuestions = questions.length;

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / totalQuestions) * 100);
  };

  const handleNext = async () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      if (quizId) {
        setIsRecordingAttempt(true);
        try {
          const score = calculateScore();
          const result = await recordQuizAttempt(quizId, score);
          if (!result.success) {
            console.error("Failed to record quiz attempt:", result.error);
          }
        } catch (error) {
          console.error("Error recording quiz attempt:", error);
        } finally {
          setIsRecordingAttempt(false);
        }
      }
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <h3 className="text-2xl font-bold">Quiz Complete!</h3>
          <div className="text-4xl font-bold text-primary">{score}%</div>
          <p className="text-muted-foreground">
            You scored{" "}
            {
              selectedAnswers.filter(
                (answer, index) => answer === questions[index]?.correctAnswer,
              ).length
            }{" "}
            out of {totalQuestions} questions correctly.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Review:</h4>
          {questions.map((question, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <p className="font-medium mb-2">{question.question}</p>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-2 rounded text-sm ${
                      optionIndex === question.correctAnswer
                        ? "bg-green-100 text-green-800"
                        : optionIndex === selectedAnswers[index]
                          ? "bg-red-100 text-red-800"
                          : ""
                    }`}
                  >
                    {option}
                    {optionIndex === question.correctAnswer && " ✓"}
                    {optionIndex === selectedAnswers[index] &&
                      optionIndex !== question.correctAnswer &&
                      " ✗"}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <div className="space-y-6">
      <p>
        <Link href="/dashboard/quizzes">
          <ArrowLeft />
        </Link>
      </p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <div className="w-32 bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{question.question}</h3>

        <div className="space-y-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left border rounded-lg transition-colors ${
                selectedAnswers[currentQuestion] === index
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 hover:border-muted-foreground/40"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            selectedAnswers[currentQuestion] === undefined || isRecordingAttempt
          }
        >
          {isRecordingAttempt
            ? "Recording..."
            : currentQuestion === totalQuestions - 1
              ? "Finish"
              : "Next"}
        </Button>
      </div>
    </div>
  );
}
