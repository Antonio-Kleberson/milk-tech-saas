import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';
import { Helmet } from 'react-helmet-async';
import { ProducerDashboard } from '@/components/dashboard/ProducerDashboard';
import { DairyDashboard } from '@/components/dashboard/DairyDashboard';

// 🔽 helpers simples (mesma lógica usada na página Produção)
const monthBounds = (d = new Date()) => {
  const y = d.getFullYear();
  const m = d.getMonth();
  return { from: new Date(y, m, 1), to: new Date(y, m + 1, 0) };
};
const fmtDateBR = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });

function getOfficialPriceOnDate(dairyId, isoDate) {
  const prices = storage.getMilkPrices()
    .filter(p => p.dairy_id === dairyId)
    .sort((a,b) => new Date(b.effective_at) - new Date(a.effective_at));
  if (!prices.length) return null;
  const target = new Date(isoDate);
  const onOrBefore = prices.find(p => new Date(p.effective_at) <= target);
  return onOrBefore?.price_per_liter ?? prices[0].price_per_liter ?? null;
}

// caso você esteja usando meus laticínios pessoais:
import { dairiesService } from '@/lib/dairies.service';
function getMyDairyPriceOnDate(dairyId, isoDate) {
  const prices = dairiesService.listMyDairyPrices(dairyId)
    .sort((a,b) => new Date(b.effective_at) - new Date(a.effective_at));
  if (!prices.length) return null;
  const target = new Date(isoDate);
  const onOrBefore = prices.find(p => new Date(p.effective_at) <= target);
  return onOrBefore?.price_per_liter ?? prices[0].price_per_liter ?? null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    topDairies: [],
    upcomingVaccines: [],
    totalAnimals: 0,
    totalRecipes: 0,
    // novos campos (opcionais para o ProducerDashboard usar)
    production: {
      month: { manha: 0, tarde: 0, total: 0, bruto: 0 },
      sparkline: [], // [{ date:'dd/mm', total:Number }]
    },
  });

  const producerData = useMemo(() => {
    // --- dados já existentes
    const dairies = storage.getDairies();
    const prices = storage.getMilkPrices();
    const animals = storage.getAnimals().filter(a => a.owner_id === user.id);
    const vaccines = storage.getVaccines();
    const recipes = storage.getFeedRecipes().filter(r => r.owner_id === user.id);

    const dairiesWithPrices = dairies.map(dairy => {
      const latestPrice = prices
        .filter(p => p.dairy_id === dairy.id)
        .sort((a, b) => new Date(b.effective_at) - new Date(a.effective_at))[0];
      return {
        ...dairy,
        price: latestPrice?.price_per_liter || 0,
        lastUpdated: latestPrice?.effective_at
      };
    }).sort((a, b) => b.price - a.price).slice(0, 3);

    const animalIds = new Set(animals.map(a => a.id));
    const upcomingVaccines = vaccines
      .filter(v => animalIds.has(v.animal_id) && v.next_due_at && new Date(v.next_due_at) > new Date())
      .sort((a, b) => new Date(a.next_due_at) - new Date(b.next_due_at))
      .slice(0, 5)
      .map(vaccine => ({ ...vaccine, animal: animals.find(a => a.id === vaccine.animal_id) }));

    // --- NOVO: produção do mês (manhã/tarde/total/bruto) + sparkline
    const allProd = JSON.parse(localStorage.getItem('milktech:milk_production') || '[]')
      .filter(x => x.owner_id === user.id);
    const { from, to } = monthBounds();
    const monthList = allProd.filter(x => {
      const d = new Date(x.date);
      return d >= from && d <= to;
    });

    // agrega por dia
    const dayMap = new Map(); // date -> {manha, tarde, total, bruto}
    let sumManha = 0, sumTarde = 0, sumTotal = 0, sumBruto = 0;

    for (const item of monthList) {
      const k = item.date; // YYYY-MM-DD
      if (!dayMap.has(k)) dayMap.set(k, { manha:0, tarde:0, total:0, bruto:0 });
      const cell = dayMap.get(k);

      const litros = Number(item.liters || 0);
      if (item.shift === 'morning') { cell.manha += litros; sumManha += litros; }
      else                          { cell.tarde += litros; sumTarde += litros; }

      // preço de referência (usa unit_price_at_sale se existir; senão busca no laticínio)
      let unitPrice = item.unit_price_at_sale != null ? Number(item.unit_price_at_sale) : null;
      if (unitPrice == null && item.dairy_id) {
        unitPrice = item.dairy_type === 'mine'
          ? getMyDairyPriceOnDate(item.dairy_id, item.date)
          : getOfficialPriceOnDate(item.dairy_id, item.date);
      }
      const brutoItem = unitPrice != null ? litros * Number(unitPrice) : 0;
      cell.bruto += brutoItem;
      sumBruto += brutoItem;
    }

    // calcula total por dia + sparkline
    const sparkline = Array.from(dayMap.entries())
      .sort((a,b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, v]) => {
        v.total = v.manha + v.tarde;
        return { date: fmtDateBR(date), total: v.total };
      });

    sumTotal = sumManha + sumTarde;

    return {
      topDairies: dairiesWithPrices,
      upcomingVaccines,
      totalAnimals: animals.length,
      totalRecipes: recipes.length,
      production: {
        month: {
          manha: sumManha,
          tarde: sumTarde,
          total: sumTotal,
          bruto: Number(sumBruto.toFixed(2)), // arredonda 2 casas
        },
        sparkline,
      },
    };
  }, [user.id]);

  useEffect(() => {
    if (user?.role === 'producer') {
      setDashboardData(producerData);
    }
  }, [user, producerData]);

  const helmetTitle = user?.role === 'producer' ? 'Dashboard do Produtor' : 'Dashboard da Queijaria';
  const helmetDesc = user?.role === 'producer' 
    ? 'Acompanhe os preços do leite, gerencie seus animais, produção e receitas de ração na plataforma MilkTech.'
    : 'Gerencie os preços do leite e tanques de coleta da sua queijaria na plataforma MilkTech.';

  return (
    <>
      <Helmet>
        <title>{helmetTitle} - MilkTech</title>
        <meta name="description" content={helmetDesc} />
        <meta property="og:title" content={`${helmetTitle} - MilkTech`} />
        <meta property="og:description" content={helmetDesc} />
      </Helmet>
      
      {user?.role === 'producer' 
        ? <ProducerDashboard user={user} data={dashboardData} /> 
        : <DairyDashboard user={user} />}
    </>
  );
};

export default Dashboard;
