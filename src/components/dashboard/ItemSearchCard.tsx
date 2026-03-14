'use client';

interface ItemSearchCardProps {
  id: string;
  title: string;
  image: string;
  location: string;
  description: string;
  timeAgo: string;
  reward?: number;
  status?: 'available' | 'in-negotiation' | 'claimed';
  kyc?: boolean;
  onClaim?: () => void;
  showBlur?: boolean;
}

export default function ItemSearchCard({
  title,
  image,
  location,
  description,
  timeAgo,
  reward,
  status = 'available',
  kyc = false,
  onClaim,
  showBlur = true,
}: ItemSearchCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return { bg: 'bg-primary', text: 'DISPONÍVEL' };
      case 'in-negotiation':
        return { bg: 'bg-amber-500', text: 'EM NEGOCIAÇÃO' };
      case 'claimed':
        return { bg: 'bg-slate-400', text: 'REIVINDICADO' };
      default:
        return { bg: 'bg-primary', text: 'DISPONÍVEL' };
    }
  };

  const statusColor = getStatusColor();
  const isDisabled = status !== 'available';

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all">
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
        />

        {/* Blur Overlay for Security */}
        {showBlur && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {kyc ? (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              KYC OK
            </span>
          ) : (
            <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">shield</span>
              VERIFICADO
            </span>
          )}
          {reward && (
            <span className="bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
              RECOMPENSA: R$ {reward.toLocaleString('pt-BR')}
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-3 right-3">
          <span
            className={`${statusColor.bg} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-tighter`}
          >
            {statusColor.text}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className={`p-4 flex flex-col gap-3 ${isDisabled && status === 'in-negotiation' ? 'opacity-80' : ''}`}
      >
        {/* Title and Time */}
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
            {timeAgo}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span>{location}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
          {description}
        </p>

        {/* Action Button */}
        <button
          onClick={onClaim}
          disabled={isDisabled}
          className={`mt-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
            isDisabled
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200'
          }`}
        >
          {isDisabled && status === 'in-negotiation' ? 'Já em Processo' : 'Solicitar Reivindicação'}
        </button>
      </div>
    </div>
  );
}
