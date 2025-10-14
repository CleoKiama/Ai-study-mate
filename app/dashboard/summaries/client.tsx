"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getSummariesAction } from "./utils/summary-server";

export type Summary = {
  id: string;
  title: string;
  content: string;
  model: string;
  tokens: number | null;
  createdAt: string;
  updatedAt: string | null;
  fileName: string | null;
};

export type Doc = {
  id: string;
  fileName: string | null;
  externalFileId: string;
  createdAt: string;
};

type SummariesClientProps = {
  initialSummaries: Summary[];
  initialDocs: Doc[];
};

export default function SummariesClient({
  initialSummaries,
  initialDocs,
}: SummariesClientProps) {
  const [openSummaries, setOpenSummaries] = useState<Set<string>>(new Set());
  const [summaries, setSummaries] = useState<Summary[]>(initialSummaries);
  const [docs] = useState<Doc[]>(initialDocs);
  const [generatingDocs, setGeneratingDocs] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const toggleSummary = (id: string) => {
    setOpenSummaries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const generateSummary = async (doc: Doc) => {
    setGeneratingDocs((prev) => new Set(prev).add(doc.id));
    setError(null);

    try {
      const response = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalFileId: doc.externalFileId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate summary");
      }

      // Refresh summaries after successful generation
      const result = await getSummariesAction();
      if (result.success) {
        const serializedSummaries = (result.summaries || []).map((s) => ({
          ...s,
          createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: s.updatedAt ? s.updatedAt.toISOString() : null,
        }));
        setSummaries(serializedSummaries);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setGeneratingDocs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(doc.id);
        return newSet;
      });
    }
  };

  const generateAllSummaries = async () => {
    for (const doc of docs) {
      if (!generatingDocs.has(doc.id)) {
        await generateSummary(doc);
      }
    }
  };

  const thisWeekCount = summaries.filter((summary) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(summary.createdAt) > weekAgo;
  }).length;

  const avgWords =
    summaries.length > 0
      ? Math.round(
          summaries.reduce(
            (acc, summary) => acc + summary.content.split(" ").length,
            0,
          ) / summaries.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Document Summaries
          </h1>
          <p className="text-muted-foreground">
            AI-generated summaries of your uploaded documents
          </p>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {summaries.length > 0 ? (
        <div className="space-y-4">
          {summaries.map((summary) => (
            <Card key={summary.id}>
              <Collapsible
                open={openSummaries.has(summary.id)}
                onOpenChange={() => toggleSummary(summary.id)}
              >
                <CardHeader className="pb-4">
                  <CollapsibleTrigger className="flex items-center justify-between w-full cursor-pointer">
                    <div>
                      <CardTitle className="text-lg">{summary.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {summary.fileName && `${summary.fileName} • `}
                        Created on{" "}
                        {new Date(summary.createdAt).toLocaleDateString()}
                        {summary.model && ` • ${summary.model}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-muted-foreground">
                        {openSummaries.has(summary.id) ? "Hide" : "Show"}{" "}
                        Summary
                      </div>
                      <div className="transform transition-transform">
                        {openSummaries.has(summary.id) ? "⌄" : "›"}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {summary.content}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>📄 Document</span>
                          <span>🤖 AI Generated</span>
                          {summary.tokens && (
                            <span>📊 {summary.tokens} tokens</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            Create Quiz
                          </Button>
                          <Button variant="outline" size="sm">
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      ) : docs.length > 0 ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Available Documents</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate AI summaries for your uploaded documents
                  </p>
                </div>
                <Button
                  onClick={generateAllSummaries}
                  disabled={generatingDocs.size > 0}
                  variant="outline"
                >
                  Generate All Summaries
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">
                        {doc.fileName || "Untitled Document"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on{" "}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => generateSummary(doc)}
                      disabled={generatingDocs.has(doc.id)}
                      size="sm"
                    >
                      {generatingDocs.has(doc.id)
                        ? "Generating..."
                        : "Generate Summary"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-4xl text-muted-foreground">📝</div>
              <div>
                <h3 className="text-lg font-medium">No summaries yet</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload documents and generate AI-powered summaries from the
                  Upload page
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = "/dashboard/upload")}
              >
                Upload Your First Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{summaries.length}</div>
              <p className="text-sm text-muted-foreground">Total Summaries</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{thisWeekCount}</div>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{avgWords}</div>
              <p className="text-sm text-muted-foreground">Avg. Words</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}