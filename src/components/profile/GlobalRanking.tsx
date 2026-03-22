'use client';

export interface RankedUser {
  position: number;
  name: string;
  xp: string;
  avatar: string;
  isCurrentUser?: boolean;
}

interface GlobalRankingProps {
  title?: string;
  subtitle?: string;
  rankedUsers?: RankedUser[];
}

const defaultRankedUsers: RankedUser[] = [
  {
    position: 1,
    name: 'Marcos V.',
    xp: '15.4k XP',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAbMsfRScURVwhbZsX-gV4tSb21NDdHOv9lBYX7sCTLQymeZ6Mpi-o7tnNRWoOjrFazq_UUhFbQ3bisPuesOFA2pogqgCmT-B1RXktiHUo4btQgvgdE7kyNIDVdQS89HdSEOhbT6i094QL24r_H3pwQAS48_uZMBYnUcBzghd2RK3Or8-75JgU58k3_vE-cGuaVSJm6nWXlnpaOGxeNlc4dCSIkVBBlYNgcTENgycBvZxTweUBwGYKnptCmqdZAjFTHP6tbbH_hMIc',
    isCurrentUser: false,
  },
  {
    position: 42,
    name: 'Alex Silva',
    xp: '4.8k XP',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARvr_EIIZUrKJDlvk2sTSR9eiuD8EjGJkJZl0JUPf5R_JFMWQAm2fSnJv791khA1pMHsAhWeHa-4itUnwWFFH-YmsTyJ2W7cdYrgekmR6qDsq3uksIVjC2m_3wcgi6Md70wEm4ROexr1FxTvAstWVSqo8GhYvsSm4xX8XKjZHmXW335PsniZ31X0fmH9UOKbjj-6T6KfFmr6cfYeYaWbCM7-5wtK00Jj7kSCIFryo-uYBR6nmfGAyDXO11WdCY55Fm-Rm3YWzV1Z4',
    isCurrentUser: true,
  },
  {
    position: 100,
    name: 'Ana Clara',
    xp: '2.1k XP',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB1kfRNX3zpphxt5a3nMRmUMvgooGvLjY8_BYh0v62N_uLwElFGx-WsPtU2n06uS8QzpR7DeviUjxvnPBcSxRjkIDSePZQ2NVZodnh8-gTo5ZwKuRCAFkBeIfnzOTYCDb8jrl-2rl9_loIGn3QtlYUfLcuk_ydKBKnLjPZ4QQbyJ4R4zWUxi3SZMRNi__35dXCsKf_cJDbmX1I_aKo3JMF4Wpo04AR_iHxF04PwUCBZYRaRxgvu58km1AKT0cVSm-drLfx4TGT53vY',
    isCurrentUser: false,
  },
];

export default function GlobalRanking({
  title = 'Ranking Global',
  subtitle = 'Você subiu 4 posições esta semana!',
  rankedUsers = defaultRankedUsers,
}: GlobalRankingProps) {
  return (
    <div className="bg-gradient-to-br from-primary to-blue-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
      {/* Background Icon */}
      <span
        className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/10 text-9xl"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        workspace_premium
      </span>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-2xl font-black mb-2">{title}</h3>
        <p className="text-white/80 text-sm mb-6">{subtitle}</p>

        {/* Ranking List */}
        <div className="space-y-4">
          {rankedUsers.map((user) => (
            <div
              key={user.position}
              className={`flex items-center justify-between p-3 rounded-xl backdrop-blur-md transition-all ${
                user.isCurrentUser
                  ? 'bg-white/20 ring-2 ring-white/50 scale-105'
                  : 'bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold text-xl ${
                    !user.isCurrentUser && 'opacity-50'
                  }`}
                >
                  {user.position}
                </span>
                <div
                  className="size-8 rounded-full bg-white/20 overflow-hidden flex-shrink-0"
                  data-alt={`${user.name} profile thumbnail`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={user.name}
                    className="w-full h-full object-cover"
                    src={user.avatar}
                  />
                </div>
                <span className="font-semibold text-sm">
                  {user.name}
                  {user.isCurrentUser && ' (Você)'}
                </span>
              </div>
              <span className="font-black">{user.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
