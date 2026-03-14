'use client';

interface ProfileCardProps {
  name: string;
  memberSince: string;
  avatar: string;
  isVerified?: boolean;
  onEditProfile?: () => void;
  onShare?: () => void;
}

export default function ProfileCard({
  name,
  memberSince,
  avatar,
  isVerified = true,
  onEditProfile,
  onShare,
}: ProfileCardProps) {
  return (
    <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
      {/* Avatar with Verification Badge */}
      <div className="relative">
        <div
          className="size-32 rounded-full overflow-hidden border-4 border-primary/10 bg-slate-200 dark:bg-slate-700"
          data-alt="Large user profile picture"
        >
          <img
            alt={name}
            className="w-full h-full object-cover"
            src={avatar}
          />
        </div>
        {isVerified && (
          <div className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full border-4 border-white dark:border-background-dark">
            <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          </div>
        )}
      </div>

      {/* User Info */}
      <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
        {name}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm">Membro desde {memberSince}</p>

      {/* Action Buttons */}
      <div className="w-full mt-6 space-y-2">
        <button
          onClick={onEditProfile}
          className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Editar Perfil
        </button>
        <button
          onClick={onShare}
          className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Compartilhar
        </button>
      </div>
    </div>
  );
}
