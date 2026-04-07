import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const SCRIPT_MAP: Record<string, { filePath: string; filename: string }> = {
  windows: { filePath: "scripts/apply-hosts.ps1", filename: "apply-hosts.ps1" },
  "windows-cmd": { filePath: "scripts/apply-hosts.cmd", filename: "apply-hosts.cmd" },
  unix: { filePath: "scripts/apply-hosts.sh", filename: "apply-hosts.sh" },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const script = SCRIPT_MAP[name];

  if (!script) {
    return NextResponse.json({ message: "Script not found" }, { status: 404 });
  }

  const absolutePath = path.join(process.cwd(), script.filePath);
  const content = await readFile(absolutePath, "utf-8");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${script.filename}"`,
      "Cache-Control": "no-cache",
    },
  });
}
