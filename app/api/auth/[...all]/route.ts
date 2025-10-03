import { auth } from "@/utils/auth.server";

export async function GET(request: Request) {
  console.log("Auth route get request");
  return auth.handler(request);
}

export async function POST(request: Request) {
  console.log("Auth route post request");
  return auth.handler(request);
}

