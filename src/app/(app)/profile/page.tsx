'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/Footer';
import ProfileCard from '@/components/profile/ProfileCard';
import SecurityCard from '@/components/profile/SecurityCard';
import StatsMetrics from '@/components/profile/StatsMetrics';
import ActivityHistory, { ActivityItem } from '@/components/profile/ActivityHistory';
import GlobalRanking from '@/components/profile/GlobalRanking';
import BadgesHonor from '@/components/profile/BadgesHonor';
import RoleToggle from '@/components/profile/RoleToggle';
import MagicMenu from '@/components/dashboard/MagicMenu';
import { useAuth } from '@/hooks/useAuth';
import { supabaseBrowser as supabase } from '@/lib/supabase-browser';
import { formatRelativeTime, formatCurrency } from '@/utils/helpers';

export default function UserProfilePage() {
  const { user: authUser } = useAuth();
  const [activeRole, setActiveRole] = useState<'finder' | 'owner'>('finder');
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<any>({
    reputation: 5.0,
    reputationCount: 0,
    rewardsAmount: "R$ 0,00",
    rewardsPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.id) return;

    let mounted = true;

    async function fetchData() {
      try {
        // Fetch Real Activities
        const { data: acts } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', authUser!.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (mounted && acts) {
          const formattedActs: ActivityItem[] = acts.map((act: any) => {
            let icon = 'history';
            if (act.type === 'reward_received' || act.type === 'payment') icon = 'payments';
            if (act.type === 'item_registered' || act.type === 'item') icon = 'package_2';
            if (act.type === 'badge_earned' || act.type === 'badge') icon = 'stars';
            
            return {
              id: act.id,
              type: 'reward', 
              title: act.description || 'Atividade',
              description: act.type,
              value: act.value ? `+${act.value}` : '',
              date: formatRelativeTime(new Date(act.created_at)),
              icon,
            };
          });
          setActivities(formattedActs);
        }

        // Fetch user stats from payments and ratings
        const { data: payments } = await supabase
          .from('payments')
          .select('total_amount, status')
          .eq('status', 'completed');
        
        let totalRewards = 0;
        if (payments) {
          totalRewards = payments.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
        }

        if (mounted) {
          setStats({
            reputation: authUser?.rating || 5.0,
            reputationCount: 0,
            rewardsAmount: formatCurrency(totalRewards),
            rewardsPercentage: 0,
          });
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();

    return () => { mounted = false; };
  }, [authUser]);

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
  };

  const handleShare = () => {
    console.log('Share profile clicked');
  };

  const handleViewAllActivities = () => {
    console.log('View all activities clicked');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <Header user={authUser} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <ProfileCard
              name={authUser?.name || 'Carregando...'}
              memberSince={authUser?.created_at ? new Date(authUser.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : ''}
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
            {loading ? (
              <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <StatsMetrics
                reputation={stats.reputation}
                reputationCount={stats.reputationCount}
                rewardsAmount={stats.rewardsAmount}
                rewardsPercentage={stats.rewardsPercentage}
                rankingPosition={authUser?.rank_position || 1}
                rankingBadge={authUser?.level || "Bronze"}
              />
            )}

            {/* Activity History */}
            {loading ? (
              <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <ActivityHistory
                activities={activities.length > 0 ? activities : [
                  { id: 'empty', type: 'reward', title: 'Nenhuma atividade', description: 'Comece a explorar o sistema!', value: '', date: '', icon: 'info' }
                ]}
                onViewAll={handleViewAllActivities}
              />
            )}

            {/* Bottom Section: Ranking + Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GlobalRanking />
              <BadgesHonor progressPercentage={80} nextLevel="Plata" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}