import { getUserFilesAction } from "./utils/chat-server";
import ChatClient from "./client";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const result = await getUserFilesAction();
  
  if (!result.success) {
    if (result.error === "Authentication required") {
      redirect("/login");
    }
    // Handle other errors by showing empty state
    return <ChatClient initialFiles={[]} />;
  }

  return <ChatClient initialFiles={result.files || []} />;
}