import { NextResponse } from "next/server";

import { ensureUserProfile } from "@/lib/auth-profile";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client is not available.");
    }

    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha sao obrigatorios." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: String(password),
      email_confirm: true,
      user_metadata: {
        name: String(name).trim(),
        phone: String(phone || "").trim(),
      },
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message || "Nao foi possivel criar a conta." },
        { status: 400 }
      );
    }

    await ensureUserProfile(data.user, {
      name: String(name).trim(),
      phone: String(phone || "").trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro interno ao criar conta." },
      { status: 500 }
    );
  }
}
