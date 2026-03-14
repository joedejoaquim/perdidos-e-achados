'use client';

export interface RewardFlowStep {
  icon: string;
  label: string;
  completed: boolean;
}

interface RewardFlowCardProps {
  title?: string;
  itemDescription?: string;
  protocol?: string;
  status?: string;
  rewardAmount?: string;
  currentStep?: number;
  totalSteps?: number;
  message?: string;
}

export default function RewardFlowCard({
  title = 'Fluxo de Recompensa Seguro',
  itemDescription = 'Item: Chave BMW Série 3 • Protocolo #99281',
  status = 'Pagamento Retido',
  currentStep = 1,
  totalSteps = 4,
  message = 'Seu pagamento de R$ 250,00 está protegido em custódia até que você confirme o recebimento do item.',
}: RewardFlowCardProps) {
  const steps: RewardFlowStep[] = [
    { icon: 'lock', label: 'Pagamento Retido', completed: currentStep >= 1 },
    { icon: 'description', label: 'Doc. Entregue', completed: currentStep >= 2 },
    { icon: 'check_circle', label: 'Confirmação', completed: currentStep >= 3 },
    { icon: 'handshake', label: 'Liberação', completed: currentStep >= 4 },
  ];

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <span className="material-symbols-outlined text-3xl">currency_exchange</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            <p className="text-sm text-slate-500">{itemDescription}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-400">Status Atual:</span>
          <span className="text-sm font-bold text-primary">{status}</span>
        </div>
      </div>

      {/* Progress Bar with Steps */}
      <div className="relative mt-8 mb-4">
        {/* Background bar */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full"></div>

        {/* Progress bar */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index + 1 === currentStep;
            const isCompleted = index + 1 < currentStep;

            return (
              <div
                key={index}
                className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ring-4 transition-all ${
                    isActive
                      ? 'bg-primary text-white ring-primary/20'
                      : isCompleted
                        ? 'bg-primary text-white ring-primary/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 ring-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm font-bold">
                    {step.icon}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-tight ${
                    isActive || isCompleted
                      ? 'text-primary'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Message */}
      <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs italic">
        <span className="material-symbols-outlined text-sm">info</span>
        <span>{message}</span>
      </div>
    </section>
  );
}
