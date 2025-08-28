// src/components/dashboard/ProducerDashboard.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard'; // você já tem esse
import { TopDairiesCard } from '@/components/dashboard/TopDairiesCard'; // você já tem esse
import { UpcomingVaccinesCard } from '@/components/dashboard/UpcomingVaccinesCard'; // você já tem esse
import { motion } from 'framer-motion';
import { BookOpen, Beaker, Droplet, DollarSign } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export const ProducerDashboard = ({ user, data }) => {
  const { topDairies = [], upcomingVaccines = [], totalAnimals = 0, totalRecipes = 0 } = data || {};
  const month = data?.production?.month || { manha: 0, tarde: 0, total: 0, bruto: 0 };
  const sparkline = data?.production?.sparkline || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Olá, {user?.name}</h1>
        <p className="text-gray-600">Visão geral da sua produção e atividades.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} title="Animais" value={totalAnimals} delay={0.0} color="blue" />
        <StatCard icon={Beaker} title="Misturas" value={totalRecipes} delay={0.05} color="purple" />
        <StatCard icon={Droplet} title="Produção no mês (L)" value={month.total} delay={0.1} color="green" />
        <StatCard icon={DollarSign} title="Bruto no mês (R$)" value={month.bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} delay={0.15} color="orange" />
      </div>

      {/* Produção do mês + gráfico */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Produção do mês</CardTitle>
            <CardDescription>Totais por turno e evolução diária</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Subtotais */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-green-50 text-center">
                  <p className="text-xs text-gray-600">Manhã</p>
                  <p className="text-xl font-bold text-green-700">{month.manha}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-center">
                  <p className="text-xs text-gray-600">Tarde</p>
                  <p className="text-xl font-bold text-blue-700">{month.tarde}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 text-center">
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-800">{month.total}</p>
                </div>
              </div>

              {/* Sparkline */}
              <div className="lg:col-span-2 h-40">
                {sparkline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkline} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="total" dot />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">
                    Sem dados de produção no mês.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top laticínios e Vacinas próximas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <TopDairiesCard dairies={topDairies} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <UpcomingVaccinesCard vaccines={upcomingVaccines} />
        </motion.div>
      </div>
    </div>
  );
};

export default ProducerDashboard;
