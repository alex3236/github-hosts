import { NextResponse } from "next/server";

const SCRIPT_MAP: Record<string, { publicPath: string }> = {
  windows: { publicPath: "/scripts/apply-hosts.ps1" },
  unix: { publicPath: "/scripts/apply-hosts.sh" },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const script = SCRIPT_MAP[name];

  if (!script) {
    return NextResponse.json({ message: "Script not found" }, { status: 404 });
  }

  const targetUrl = new URL(script.publicPath, request.url);
  return NextResponse.redirect(targetUrl, { status: 307 });
}
