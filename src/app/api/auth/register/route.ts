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

    // 1. Criar o usuário no Auth do Supabase
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
      // Se o usuário já existe no Auth, retornar erro amigável
      if (error?.message?.includes("already been registered") || error?.message?.includes("already exists")) {
        return NextResponse.json(
          { error: "Este email já está cadastrado. Tente fazer login." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error?.message || "Nao foi possivel criar a conta." },
        { status: 400 }
      );
    }

    // 2. Sincronizar o perfil na tabela public.users
    // O Trigger pode já ter feito isso, então ensureUserProfile usa upsert
    try {
      await ensureUserProfile(data.user, {
        name: String(name).trim(),
        phone: String(phone || "").trim(),
      });
    } catch (profileError: any) {
      // Se o erro for de duplicata (o Trigger já criou), ignoramos
      if (
        profileError?.message?.includes("duplicate key") ||
        profileError?.message?.includes("unique constraint")
      ) {
        console.warn("Profile already created by trigger, skipping.");
      } else {
        // Logamos o erro mas não falhamos — o usuário já foi criado no Auth
        console.error("Profile sync error (non-blocking):", profileError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro interno ao criar conta." },
      { status: 500 }
    );
  }
}
