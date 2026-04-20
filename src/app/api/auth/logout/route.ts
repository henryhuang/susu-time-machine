import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { clearSession } from "@/server/auth";

export async function POST() {
  await clearSession();
  redirect("/admin/login");
}

export async function GET() {
  await clearSession();
  return NextResponse.redirect(new URL("/admin/login", process.env.APP_URL || "http://localhost:3000"));
}
