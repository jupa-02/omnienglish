'use client';

import React, { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Trophy, ChevronUp, Crown, Medal } from 'lucide-react';
import { useAudioEffects } from '@/hooks/useAudioEffects';
import { motion } from 'framer-motion';

const FALLBACK_USERS = [
  { rank: 1, full_name: 'Sandra Carolina (Tú)', xp_points: 420, avatar_url: '👑', isUser: true },
  { rank: 2, full_name: 'Elena Rostova', xp_points: 380, avatar_url: '👩‍🔬', isUser: false },
  { rank: 3, full_name: 'Carlos Méndez', xp_points: 310, avatar_url: '👨‍💼', isUser: false },
  { rank: 4, full_name: 'Lucas Silva', xp_points: 290, avatar_url: '👨‍💻', isUser: false },
  { rank: 5, full_name: 'Camila Morales', xp_points: 260, avatar_url: '👩‍🏫', isUser: false },
];

export default function LeaderboardPage() {
  const [activeLeague, setActiveLeague] = useState('Oro');
  const [users, setUsers] = useState(FALLBACK_USERS);
  const [loading, setLoading] = useState(true);
  const { playClick } = useAudioEffects();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
        const cleanUrl = rawUrl.replace(/\/+$/, '');
        const API_BASE_URL = cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
        const res = await fetch(`${API_BASE_URL}/gamification/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          const formatted = data.leaderboard.map((u: any) => ({
            rank: u.rank,
            full_name: u.full_name,
            xp_points: u.xp_points,
            avatar_url: u.avatar_url,
            isUser: u.full_name.includes('(Tú)') || u.full_name === 'You',
          }));
          setUsers(formatted.slice(0, 10));
        }
      } catch {
        // Using fallback data
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <PageWrapper maxWidth="max-w-xl">
      <div className="space-y-8 pb-16">
        {/* Trophy Header */}
        <div className="p-8 rounded-2xl bg-white border border-amber-200 text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500" />
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 border-4 border-white shadow-md flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 fill-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Liga {activeLeague}
            </h1>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
              Los 3 mejores avanzan a la siguiente liga. ¡Termina en 3 días!
            </p>
          </div>
        </div>

        {/* Rankings */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Cargando liga...</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user, idx) => {
                const isTop3 = user.rank <= 3;
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={user.rank}
                    className={`flex items-center justify-between p-4 transition-colors ${
                      user.isUser
                        ? 'bg-indigo-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-8 text-center font-bold text-base ${
                          user.rank === 1
                            ? 'text-amber-500'
                            : user.rank === 2
                            ? 'text-gray-400'
                            : user.rank === 3
                            ? 'text-amber-700'
                            : 'text-gray-400'
                        }`}
                      >
                        {user.rank}
                      </span>

                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-xl overflow-hidden shrink-0">
                        {user.avatar_url.startsWith('http') ? (
                          <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          user.avatar_url
                        )}
                      </div>

                      <div>
                        <h4 className={`text-sm font-bold ${user.isUser ? 'text-indigo-700' : 'text-gray-900'}`}>
                          {user.full_name}
                        </h4>
                        {isTop3 && (
                          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Zona de Ascenso</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="font-bold text-sm text-gray-900">
                      {user.xp_points} XP
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
