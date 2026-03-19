import { NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/auth-profile";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha sao obrigatorios." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const normalizedEmail = String(email).trim().toLowerCase();

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: String(password),
    });

    if (error || !user) {
      return NextResponse.json(
        { error: error?.message || "Nao foi possivel fazer login." },
        { status: 401 }
      );
    }

    await ensureUserProfile(user);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro interno ao fazer login." },
      { status: 500 }
    );
  }
}
