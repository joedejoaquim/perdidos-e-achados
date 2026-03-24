"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { m } from "framer-motion";

export default function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-16">
      {/* Hero */}
      <m.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 text-center"
      >
        <h1 className="text-5xl font-bold mb-4">
          Encontrou algo perdido?
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Conecte-se com quem perdeu. Ajude de forma simples e receba recompensas.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
          >
            Começar Agora
          </Link>
          <Link
            href="/search"
            className="px-8 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/5 transition"
          >
            Buscar Item
          </Link>
        </div>
      </m.section>

      {/* How it works */}
      <m.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="py-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              number: "1",
              title: "Registrar",
              description: "Encontrou um documento? Registre com foto e detalhes",
              icon: "📝",
            },
            {
              number: "2",
              title: "Aguardar",
              description: "O proprietário busca na plataforma",
              icon: "⏳",
            },
            {
              number: "3",
              title: "Devolver",
              description: "Entregue o item ao dono de forma segura",
              icon: "🤝",
            },
            {
              number: "4",
              title: "Ganhar",
              description: "Receba recompensa após confirmação",
              icon: "💰",
            },
          ].map((step, i) => (
            <m.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-4">
                {step.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </m.div>
          ))}
        </div>
      </m.section>

      {/* Benefits */}
      <m.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="py-16 bg-secondary/5 rounded-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-center mb-12">Benefícios</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {[
            {
              title: "Rápido e Seguro",
              description: "Plataforma segura com pagamento em custódia",
              icon: "🔒",
            },
            {
              title: "Ganhe Recompensas",
              description: "Receba até 80% da taxa de resgate",
              icon: "🏆",
            },
            {
              title: "Suba de Nível",
              description: "Ganhe XP e conquiste badges especiais",
              icon: "⭐",
            },
            {
              title: "Ajude a Comunidade",
              description: "Impacto social positivo e solidariedade",
              icon: "❤️",
            },
          ].map((benefit, i) => (
            <m.div
              key={benefit.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex gap-4"
            >
              <span className="text-4xl flex-shrink-0">{benefit.icon}</span>
              <div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {benefit.description}
                </p>
              </div>
            </m.div>
          ))}
        </div>
      </m.section>

      {/* Testimonials */}
      <m.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="py-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12">Depoimentos</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "João Silva",
              role: "Localizador",
              text: "Fácil, rápido e seguro. Já ajudei várias pessoas!",
              rating: 5,
            },
            {
              name: "Maria Santos",
              role: "Proprietária",
              text: "Encontrei meu RG em minutos! Recomendo!",
              rating: 5,
            },
            {
              name: "Pedro Costa",
              role: "Localizador",
              text: "Ótima forma de ganhar uma renda extra ajudando.",
              rating: 5,
            },
          ].map((testimonial) => (
            <m.div
              key={testimonial.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="mb-4">
                {"⭐".repeat(testimonial.rating)}
              </div>
              <p className="mb-4 text-foreground">&ldquo;{testimonial.text}&rdquo;</p>
              <p className="font-semibold">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </m.div>
          ))}
        </div>
      </m.section>

      {/* CTA */}
      <m.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="py-16 text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8"
      >
        <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
        <p className="text-muted-foreground mb-8">
          Cadastre-se agora e comece a ajudar pessoas a recuperar seus itens.
        </p>
        <Link
          href="/auth/register"
          className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
        >
          Criar Conta Grátis
        </Link>
      </m.section>
    </div>
  );
}
