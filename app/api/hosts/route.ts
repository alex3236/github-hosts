import { getHostsContent } from "@/lib/hosts";
import { NextResponse } from "next/server";

export async function GET() {
  const content = await getHostsContent();
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
