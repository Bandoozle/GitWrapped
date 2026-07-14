import { NextResponse } from "next/server";
import { isGitHubAuthConfigured } from "@/auth";

export async function GET() {
  return NextResponse.json({
    githubAuth: isGitHubAuthConfigured(),
  });
}
