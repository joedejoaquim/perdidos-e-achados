'use client';

import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeRef.current?.focus(), 50);
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        >
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-policy-title"
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header fixo */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-0.5">Achados</p>
                <h2 id="privacy-policy-title" className="text-lg font-black text-slate-900 dark:text-white">
                  Política de Privacidade e Protecção de Dados
                </h2>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Fechar política de privacidade"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Conteúdo com scroll */}
            <div className="overflow-y-auto px-8 py-6 space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">

              <p className="text-xs text-slate-400">Última actualização: Março de 2026 · Versão 1.0</p>

              {/* 1 */}
              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Quem somos</h3>
                <p>
                  A <strong className="text-slate-800 dark:text-slate-200">ACHADOS</strong> é uma plataforma digital brasileira que conecta pessoas que encontraram documentos e objectos perdidos com os seus verdadeiros proprietários. Actuamos como intermediária segura no processo de devolução, garantindo a protecção dos dados de todos os envolvidos.
                </p>
                <p className="mt-2">
                  Responsável pelo tratamento de dados: <strong className="text-slate-800 dark:text-slate-200">Fernando Júnior Grão Paim Quipiaca</strong> — suporte@achados.com.br
                </p>
              </section>

              {/* 2 */}
              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Dados que recolhemos</h3>
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Dados de identificação</p>
                    <p>Nome completo, endereço de email, número de telefone e fotografia de perfil, fornecidos no momento do registo.</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Dados KYC (Know Your Customer)</p>
                    <p>Para receber pagamentos, recolhemos CPF, data de nascimento, comprovativo de morada, documento de identidade e selfie. Estes dados são tratados com o mais alto nível de segurança e utilizados exclusivamente para verificação de identidade.</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Dados de actividade</p>
                    <p>Itens registados, reivindicações efectuadas, histórico de transacções, pontuação XP, badges e posição no ranking.</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Dados técnicos</p>
                    <p>Endereço IP, tipo de dispositivo, sistema operativo e dados de navegação, recolhidos automaticamente para segurança e melhoria do serviço.</p>
                  </div>
                </div>
              </section>

              {/* 3 */}
              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Como utilizamos os seus dados</h3>
                <ul className="space-y-2">
                  {[
                    'Prestar o serviço de intermediação na devolução de itens perdidos',
                    'Verificar a sua identidade e prevenir fraudes (KYC)',
                    'Processar pagamentos e transferências via Stripe',
                    'Enviar notificações sobre reivindicações e actualizações de estado',
                    'Calcular e atribuir pontos XP, badges e posição no ranking',
                    'Cumprir obrigações legais e regulatórias',
                    'Melhorar a plataforma com base em dados agregados e anónimos',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[14px] text-primary mt-0.5 shrink-0">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* 4 */}
              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. Base legal (LGPD)</h3>
                <p>O tratamento dos seus dados é realizado com base nas seguintes hipóteses previstas na Lei Geral de Protecção de Dados (Lei nº 13.709/2018):</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    { base: 'Execução de contrato', desc: 'Para prestar o serviço que você contratou' },
                    { base: 'Consentimento', desc: 'Para envio de comunicações de marketing e notificações opcionais' },
                    { base: 'Obrigação legal', desc: 'Para cumprir exigências fiscais e regulatórias' },
                    { base: 'Legítimo interesse', desc: 'Para prevenção de fraudes e segurança da plataforma' },
                  ].map(({ base, desc }) => (
                    <li key={base} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-400 mt-0.5 shrink-0">arrow_right</span>
                      <span><strong className="text-slate-800 dark:text-slate-200">{base}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 5 */}
              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">5. Partilha de dados</h3>
                <p>Os seus dados <strong className="text-slate-800 dark:text-slate-200">nunca são vendidos</strong> a terceiros. Partilhamos apenas o estritamente necessário com:</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    { who: 'Stripe', why: 'Processamento seguro de pagamentos' },
                    { who: 'Supabase', why: 'Armazenamento de dados em servidores seguros (AWS)' },
                    { who: 'Resend', why: 'Envio de notificações por email' },
                    { who: 'Autoridades competentes', why: 'Quando exigido por lei ou ordem judicial' },
                  ].map(({ who, why }) => (
                    <li key={who} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-400 mt-0.5 shrink-0">arrow_right</span>
                      <span><strong className="text-slate-800 dark:text-slate-200">{who}:</strong> {why}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 6 */}
              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">6. Segurança dos dados</h3>
                <p>Implementamos medidas técnicas e organizacionais para proteger os seus dados:</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { icon: 'lock', label: 'Criptografia AES-256 em repouso' },
                    { icon: 'https', label: 'TLS/HTTPS em todas as comunicações' },
                    { icon: 'shield', label: 'Row Level Security (RLS) no banco de dados' },
                    { icon: 'verified_user', label: 'Verificação KYC em 3 camadas' },
                    { icon: 'manage_accounts', label: 'Acesso restrito por função (RBAC)' },
                    { icon: 'security', label: 'Monitorização contínua de ameaças' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5">
                      <span className="material-symbols-outlined text-[16px] text-primary shrink-0">{icon}</span>
                      <span className="text-xs text-slate-700 dark:text-slate-300">{label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 7 */}
              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">7. Os seus direitos (LGPD)</h3>
                <p>Nos termos da LGPD, você tem os seguintes direitos sobre os seus dados pessoais:</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    'Acesso — saber quais dados temos sobre si',
                    'Correcção — rectificar dados incompletos ou incorrectos',
                    'Eliminação — solicitar a exclusão dos seus dados',
                    'Portabilidade — exportar os seus dados em formato legível',
                    'Oposição — opor-se ao tratamento em determinadas circunstâncias',
                    'Revogação do consentimento — a qualquer momento, sem penalização',
                    'Informação — saber com quem partilhámos os seus dados',
                  ].map(right => (
                    <li key={right} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[14px] text-primary mt-0.5 shrink-0">check</span>
                      {right}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-xl bg-primary/5 dark:bg-primary/10 px-4 py-3 text-xs">
                  Para exercer qualquer um destes direitos, aceda às <strong>Configurações → Privacidade & App</strong> ou contacte-nos em <strong>suporte@achados.com.br</strong>.
                </p>
              </section>

              {/* 8 */}
              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">8. Retenção de dados</h3>
                <p>Conservamos os seus dados pelo tempo necessário para prestar o serviço e cumprir obrigações legais:</p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    { type: 'Dados de conta activa', period: 'Enquanto a conta estiver activa' },
                    { type: 'Dados de transacções', period: '5 anos (obrigação fiscal brasileira)' },
                    { type: 'Dados KYC', period: '5 anos após o último uso' },
                    { type: 'Logs de segurança', period: '1 ano' },
                    { type: 'Após exclusão de conta', period: 'Eliminação imediata, excepto obrigações legais' },
                  ].map(({ type, period }) => (
                    <li key={type} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[14px] text-slate-400 mt-0.5 shrink-0">schedule</span>
                      <span><strong className="text-slate-800 dark:text-slate-200">{type}:</strong> {period}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 9 */}
              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">9. Cookies</h3>
                <p>Utilizamos apenas cookies estritamente necessários para o funcionamento da plataforma (autenticação e preferências de sessão). Não utilizamos cookies de rastreamento ou publicidade.</p>
              </section>

              {/* 10 */}
              <section>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">10. Contacto e reclamações</h3>
                <p>Para questões sobre privacidade ou para exercer os seus direitos:</p>
                <div className="mt-3 space-y-2">
                  {[
                    { icon: 'mail', label: 'Email', value: 'suporte@achados.com.br' },
                    { icon: 'gavel', label: 'ANPD', value: 'Autoridade Nacional de Protecção de Dados — gov.br/anpd' },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                      <span className="material-symbols-outlined text-[18px] text-primary shrink-0">{icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Footer fixo */}
            <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400">© 2026 ACHADOS · Todos os direitos reservados</p>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Fechar
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
