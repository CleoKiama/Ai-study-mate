"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { askDocQuestionAction, type UserFile } from "./utils/chat-server";
import Link from "next/link";
import { Send, FileText, Bot, User, AlertCircle } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatClientProps = {
  initialFiles: UserFile[];
};

export default function ChatClient({ initialFiles }: ChatClientProps) {
  const [files] = useState<UserFile[]>(initialFiles);
  const [selectedFileId, setSelectedFileId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  const selectedFile = files.find(f => f.externalFileId === selectedFileId);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedFileId || isLoading) return;

    // Abort any existing request
    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    // Optimistically add user message
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    // Add placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Prepare conversation history for context
      const history = messages.slice(-4).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Try streaming first
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          externalFileId: selectedFileId,
          message: userMessage.content,
          history,
        }),
        signal: newAbortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          streamedContent += chunk;

          // Update the assistant message incrementally
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: streamedContent }
              : msg
          ));
        }
      } finally {
        reader.releaseLock();
      }

    } catch (err: unknown) {
      // Handle abort gracefully
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Request aborted");
        return;
      }

      console.error("Streaming failed, trying fallback:", err);
      
      // Fallback to server action
      try {
        const history = messages.slice(-4).map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

        const result = await askDocQuestionAction({
          externalFileId: selectedFileId,
          message: userMessage.content,
          history,
        });

        if (result.success && result.answer) {
          // Update the assistant message with the fallback response
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: result.answer || "No response received" }
              : msg
          ));
        } else {
          setError(result.error || "Failed to get response");
          // Remove both messages on error
          setMessages(prev => prev.filter(msg => 
            msg.id !== userMessage.id && msg.id !== assistantMessageId
          ));
        }
      } catch (fallbackErr) {
        setError("An unexpected error occurred");
        // Remove both messages on error
        setMessages(prev => prev.filter(msg => 
          msg.id !== userMessage.id && msg.id !== assistantMessageId
        ));
        console.error("Fallback error:", fallbackErr);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <FileText className="h-6 w-6" />
              No Documents Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You need to upload documents before you can chat with them.
            </p>
            <Button asChild>
              <Link href="/dashboard/upload">Upload Your First Document</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat with Documents</h1>
        <p className="text-muted-foreground">
          Ask questions about your uploaded documents and get AI-powered answers.
        </p>
      </div>

      {/* Document Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Select
              value={selectedFileId}
              onValueChange={(value) => {
                // Abort any ongoing request when switching files
                if (abortController) {
                  abortController.abort();
                  setAbortController(null);
                }
                setSelectedFileId(value);
                setMessages([]);
                setError(null);
                setIsLoading(false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a document to chat with..." />
              </SelectTrigger>
              <SelectContent>
                {files.map((file) => (
                  <SelectItem key={file.externalFileId} value={file.externalFileId}>
                    {file.fileName} (uploaded {file.uploadDate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium">{selectedFile.fileName}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      {selectedFileId && (
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Chat with {selectedFile?.fileName}
            </CardTitle>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearChat}>
                Clear Chat
              </Button>
            )}
          </CardHeader>
          
          {/* Messages */}
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto mb-4 p-4 border border-border rounded-md bg-muted/20">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Start a conversation by asking a question about the document.</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex gap-2 max-w-[80%] ${
                          message.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-background border border-border"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.role === "user"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-background border border-border rounded-lg p-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-4">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  ×
                </Button>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about the document..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}