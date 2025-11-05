import { NextRequest } from "next/server";
import { setupChatEngine, type ChatSetupInput } from "@/app/dashboard/chat/utils/chat-core";

export async function POST(request: NextRequest) {
  try {
    const body: ChatSetupInput = await request.json();
    
    const setupResult = await setupChatEngine(body);
    
    if (!setupResult.success) {
      return new Response(setupResult.error, { 
        status: setupResult.status || 500 
      });
    }

    const { chatEngine, contextualMessage } = setupResult;

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Get AI response with streaming enabled
          const response = await chatEngine.chat({
            message: contextualMessage,
            stream: true,
          });

          // Stream the response chunks
          for await (const chunk of response) {
            // Handle both delta and response patterns from LlamaIndex
            const text = (chunk as { delta?: string; response?: string }).delta || 
                        (chunk as { delta?: string; response?: string }).response || "";
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }

          controller.close();
        } catch (error) {
          console.error("Streaming chat error:", error);
          
          // Fallback: try non-streaming response
          try {
            const fallbackResponse = await chatEngine.chat({
              message: contextualMessage,
              stream: false,
            });
            
            const answer = fallbackResponse.message?.content as string;
            if (answer) {
              controller.enqueue(new TextEncoder().encode(answer));
            }
            controller.close();
          } catch (fallbackError) {
            console.error("Fallback chat error:", fallbackError);
            controller.error(fallbackError);
          }
        }
      },
      cancel() {
        // Handle client disconnect
        console.log("Stream cancelled by client");
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error("Stream endpoint error:", error);
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}