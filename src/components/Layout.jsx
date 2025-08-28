// src/components/Layout.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  DollarSign,
  Truck,
  BookOpen,
  Calculator,
  LogOut,
  Milk,
  Droplets,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";

// services/dados
import { milkProduction } from "@/lib/milk-production.service";
import { storage } from "@/lib/storage";

const Badge = ({ count }) => {
  if (!count || count <= 0) return null;
  const label = count > 9 ? "9+" : String(count);
  return (
    <span
      className="ml-1 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-600 text-white text-[11px] leading-none px-1"
      aria-label={`${label} pendências`}
    >
      {label}
    </span>
  );
};

// hoje local YYYY-MM-DD
const localToday = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [prodBadge, setProdBadge] = useState(0);
  const [animalsBadge, setAnimalsBadge] = useState(0);

  const recomputeBadges = () => {
    if (!user?.id) return;
    const todayISO = localToday();

    // Produção — faltando turnos de hoje
    const todayList = milkProduction
      .list(user.id, { from: todayISO, to: todayISO })
      .filter((x) => x.date === todayISO);

    const hasMorning = todayList.some((x) => x.shift === "morning" && Number(x.liters) > 0);
    const hasAfternoon = todayList.some((x) => x.shift === "afternoon" && Number(x.liters) > 0);
    setProdBadge((hasMorning ? 0 : 1) + (hasAfternoon ? 0 : 1));

    // Vacinas — vencidas ou próximas (7 dias)
    const animals = storage.getAnimals().filter((a) => a.owner_id === user.id);
    const animalIds = new Set(animals.map((a) => a.id));
    const vaccines = storage.getVaccines().filter((v) => animalIds.has(v.animal_id));

    const today = new Date();
    const in7 = new Date(today);
    in7.setDate(today.getDate() + 7);

    const needAttention = vaccines.filter((v) => {
      if (!v.next_due_at) return false;
      const d = new Date(v.next_due_at);
      return d < today || (d >= today && d <= in7);
    }).length;

    setAnimalsBadge(needAttention);
  };

  useEffect(() => {
    recomputeBadges();
    const onStorage = (e) => {
      if (e.key === "milktech:milk_production" || e.key === null) recomputeBadges();
    };
    const onCustom = () => recomputeBadges();
    window.addEventListener("storage", onStorage);
    window.addEventListener("milktech:update-badges", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("milktech:update-badges", onCustom);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Desktop (produtor): 5 principais fixos
  const producerNavItems = useMemo(
    () => [
      { path: "/dashboard", icon: Home, label: "Home" },
      { path: "/producao", icon: Droplets, label: "Produção", badge: prodBadge },
      { path: "/feed", icon: Calculator, label: "Rações" },
      { path: "/animals", icon: BookOpen, label: "Caderninho", badge: animalsBadge },
      { path: "/laticinios", icon: Milk, label: "Laticínios" },
    ],
    [prodBadge, animalsBadge],
  );

  const moreItems = useMemo(
    () => [
      { path: "/prices", icon: DollarSign, label: "Preços" },
      { path: "/tanks", icon: Truck, label: "Tanques" },
      { path: "/reports", icon: Calculator, label: "Relatórios" }, // placeholder
      { path: "/warehouse", icon: Truck, label: "Armazém" }, // placeholder
    ],
    [],
  );

  const dairyNavItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/dairy-price", icon: DollarSign, label: "Preço" },
    { path: "/dairy-tanks", icon: Truck, label: "Tanques" },
  ];

  const navItems = user?.role === "producer" ? producerNavItems : dairyNavItems;
  const isActive = (p) => location.pathname === p;

  // Dropdowns
  const [openMore, setOpenMore] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const MoreMenu = ({ alignRight }) => (
    <ul
      className={`absolute mt-2 w-56 rounded-xl border bg-white/90 backdrop-blur shadow-lg p-1 ${alignRight ? "right-0" : "left-0"}`}
      role="menu"
    >
      {moreItems.map((mi) => {
        const Icon = mi.icon;
        return (
          <li key={mi.path}>
            <Link
              to={mi.path}
              onClick={() => setOpenMore(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 text-sm"
              role="menuitem"
            >
              <Icon className="h-4 w-4" />
              <span>{mi.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const ProfileMenu = () => (
    <ul
      className="absolute mt-2 w-64 rounded-xl border bg-white/90 backdrop-blur shadow-lg p-1 right-0"
      role="menu"
    >
      <li className="px-3 py-2 text-xs text-gray-500">Conectado como</li>
      <li className="px-3 py-2 font-medium truncate">{user?.name}</li>
      <li>
        <hr className="my-1" />
      </li>
      <li>
        <button
          onClick={() => {
            setOpenProfile(false);
            navigate("/settings");
          }}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 text-sm"
          role="menuitem"
        >
          <Settings className="h-4 w-4" />
          Configurações
        </button>
      </li>
      <li>
        <button
          onClick={() => {
            setOpenProfile(false);
            handleLogout();
          }}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600"
          role="menuitem"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </li>
    </ul>
  );

  // --- MOBILE
  const mobileItems = useMemo(() => {
    if (user?.role === "producer") {
      return [
        { path: "/dashboard", icon: Home, label: "Home" },
        { path: "/producao", icon: Droplets, label: "Produção", badge: prodBadge },
        { path: "/feed", icon: Calculator, label: "Rações" },
        { path: "/animals", icon: BookOpen, label: "Caderninho", badge: animalsBadge },
        { path: "__more__", icon: MoreHorizontal, label: "Mais" },
      ];
    }
    // dairy
    return [
      { path: "/dashboard", icon: Home, label: "Home" },
      { path: "/dairy-price", icon: DollarSign, label: "Preço" },
      { path: "/dairy-tanks", icon: Truck, label: "Tanques" },
      { path: "__more__", icon: MoreHorizontal, label: "Mais" },
      { path: "/dashboard", icon: Home, label: "" }, // filler simples
    ];
  }, [user?.role, prodBadge, animalsBadge]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Top nav (desktop) */}
      <nav className="bg-white/80 backdrop-blur border-b hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Branding */}
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="flex items-center gap-2">
                <Milk className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">MilkTech</span>
              </Link>
            </div>

            {/* Fixos */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive(item.path) ? "text-green-600 bg-green-50" : "text-gray-700 hover:text-green-600 hover:bg-green-50"}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    <Badge count={item.badge} />
                  </Link>
                );
              })}

              {/* Botão Mais (desktop) */}
              <div className="relative">
                <button
                  onClick={() => setOpenMore((v) => !v)}
                  className="ml-1 inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-50 text-gray-700"
                  aria-haspopup="menu"
                  aria-expanded={openMore}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span>Mais</span>
                </button>
                {openMore && <MoreMenu alignRight={false} />}
              </div>
            </div>

            {/* Perfil / Configurações */}
            <div className="relative">
              <button
                onClick={() => {
                  setOpenProfile((v) => !v);
                  setOpenMore(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50"
                aria-haspopup="menu"
                aria-expanded={openProfile}
              >
                <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-gray-800 max-w-[180px] truncate">
                  {user?.name}
                </span>
              </button>
              {openProfile && <ProfileMenu />}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-white/80 backdrop-blur supports-backdrop-blur:backdrop-blur-lg h-14">
        <div className="grid grid-cols-5 h-full">
          {mobileItems.map((item, idx) => {
            const Icon = item.icon;
            const active = item.path !== "__more__" && isActive(item.path);
            const key = item.path || `k${idx}`;
            return (
              <button
                key={key}
                onClick={() => {
                  if (item.path === "__more__") {
                    setOpenMore((v) => !v);
                    setOpenProfile(false);
                    return;
                  }
                  if (!item.path) return; // filler
                  navigate(item.path);
                  setOpenMore(false);
                  setOpenProfile(false);
                }}
                className={`relative h-full flex flex-col items-center justify-center transition ${active ? "text-green-600" : "text-gray-600"}`}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`rounded-xl p-1 ${active ? "bg-green-50" : ""}`}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className="text-[11px] leading-3 mt-0.5">{item.label}</span>
                <div className="absolute top-1 right-4">
                  <Badge count={item.badge} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Popover “Mais” (mobile) */}
        {openMore && (
          <div className="absolute bottom-14 left-0 right-0 px-3 pb-3 z-50">
            <div className="rounded-2xl border bg-white/95 backdrop-blur shadow-xl p-2">
              {/* Laticínios entra aqui no mobile */}
              {user?.role === "producer" && (
                <button
                  onClick={() => {
                    navigate("/laticinios");
                    setOpenMore(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-green-50 text-sm"
                >
                  <Milk className="h-5 w-5" />
                  <span>Laticínios</span>
                </button>
              )}

              {moreItems.map((mi) => {
                const Icon = mi.icon;
                return (
                  <button
                    key={mi.path}
                    onClick={() => {
                      navigate(mi.path);
                      setOpenMore(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-green-50 text-sm"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{mi.label}</span>
                  </button>
                );
              })}

              <div className="my-1 border-t" />

              {/* Opções de perfil no mobile */}
              <button
                onClick={() => {
                  navigate("/settings");
                  setOpenMore(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-green-50 text-sm"
              >
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </button>
              <button
                onClick={() => {
                  setOpenMore(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-sm text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content with padding for mobile nav */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 md:pb-0 pb-[88px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
