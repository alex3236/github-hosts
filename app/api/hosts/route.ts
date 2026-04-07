import { getHostsContent } from "@/lib/hosts";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const content = await getHostsContent(requestHost);
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
