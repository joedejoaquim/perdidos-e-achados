'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/Footer';
import ProfileCard from '@/components/profile/ProfileCard';
import SecurityCard from '@/components/profile/SecurityCard';
import StatsMetrics from '@/components/profile/StatsMetrics';
import ActivityHistory, { ActivityItem } from '@/components/profile/ActivityHistory';
import GlobalRanking from '@/components/profile/GlobalRanking';
import BadgesHonor from '@/components/profile/BadgesHonor';
import RoleToggle from '@/components/profile/RoleToggle';
import { useAuth } from '@/hooks/useAuth';

export default function UserProfilePage() {
  const { user: authUser } = useAuth();
  const [activeRole, setActiveRole] = useState<'finder' | 'owner'>('finder');

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
  };

  const handleShare = () => {
    console.log('Share profile clicked');
  };

  const handleViewAllActivities = () => {
    console.log('View all activities clicked');
  };

  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'reward',
      title: 'Recompensa Recebida',
      description: 'MacBook Pro - Devolução em Curitiba',
      value: 'R$ 500,00',
      date: '12 Mai, 2024',
      icon: 'payments',
    },
    {
      id: '2',
      type: 'item',
      title: 'Novo Item Localizado',
      description: 'Chaves de carro - Shopping Estação',
      value: 'Status: Validando',
      date: '08 Mai, 2024',
      icon: 'package_2',
    },
    {
      id: '3',
      type: 'badge',
      title: 'Badge Conquistada',
      description: 'Localizador Ouro - 10 Devoluções com sucesso',
      value: '+100 XP',
      date: '01 Mai, 2024',
      icon: 'stars',
    },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <Header user={authUser} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <ProfileCard
              name={authUser?.name || 'Alex Silva'}
              memberSince="Jan 2024"
              avatar={
                authUser?.avatar_url ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAVy0vV20I4kYG1gkw1vygpD4M8pup2LP4t04iJmFu4NBio3pQndWBe37Ivb67-iLBnd2AciQEAyYh_ditEhkxXjzp3zKXS9SUkrOpEYQ61SJ_lyjX2LbPa6w8lzhfPptI9tUMKVDQCOLB_llrlih9mZ2WBAvpB0o7ygUvxiqnDrTU5kQeqTBXEfvqmJTWjZyEH4lb2DhrErWiXHPkkT2HpycDrZGQh2fqY3JMzK01P2ljlqybd-aF1GiZCytG_6VEI7DK4SstObRY'
              }
              onEditProfile={handleEditProfile}
              onShare={handleShare}
            />
            <SecurityCard />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {/* Role Toggle */}
            <RoleToggle
              activeRole={activeRole}
              onRoleChange={(role) => setActiveRole(role)}
            />

            {/* Stats Metrics */}
            <StatsMetrics
              reputation={4.9}
              reputationCount={128}
              rewardsAmount="R$ 1.240"
              rewardsPercentage={12}
              rankingPosition={42}
              rankingBadge="Ouro"
            />

            {/* Activity History */}
            <ActivityHistory
              activities={activities}
              onViewAll={handleViewAllActivities}
            />

            {/* Bottom Section: Ranking + Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GlobalRanking />
              <BadgesHonor progressPercentage={80} nextLevel="Platina" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}