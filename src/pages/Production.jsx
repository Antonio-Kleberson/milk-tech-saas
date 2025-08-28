import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { milkProduction } from "@/lib/milk-production.service";
import { dairiesService } from "@/lib/dairies.service";
import { storage } from "@/lib/storage";
import { Helmet } from "react-helmet-async";
import { toast } from "@/components/ui/use-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, BarChart3, Edit, Plus, Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const toBRL = (n) => `R$ ${Number(n || 0).toFixed(2)}`;
// ⚠️ formata a própria string YYYY-MM-DD (evita fuso/UTC)
const fmtDate = (yyyyMmDd) => {
  const [y, m, d] = String(yyyyMmDd).split("-");
  return `${d}/${m}`;
};

function monthBounds(yyyyMm) {
  const [y, m] = yyyyMm.split("-").map(Number);
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 0);
  return { from, to };
}

function getOfficialPriceOnDate(dairyId, isoDate) {
  const prices = storage
    .getMilkPrices()
    .filter((p) => p.dairy_id === dairyId)
    .sort((a, b) => new Date(b.effective_at) - new Date(a.effective_at));
  if (!prices.length) return null;
  const target = new Date(isoDate);
  const onOrBefore = prices.find((p) => new Date(p.effective_at) <= target);
  return onOrBefore?.price_per_liter ?? prices[0].price_per_liter ?? null;
}

function getMyDairyPriceOnDate(dairyId, isoDate) {
  const prices = dairiesService
    .listMyDairyPrices(dairyId)
    .sort((a, b) => new Date(b.effective_at) - new Date(a.effective_at));
  if (!prices.length) return null;
  const target = new Date(isoDate);
  const onOrBefore = prices.find((p) => new Date(p.effective_at) <= target);
  return onOrBefore?.price_per_liter ?? prices[0].price_per_liter ?? null;
}

// hoje em local-time YYYY-MM-DD
function todayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const Production = () => {
  const { user } = useAuth();

  // mês selecionado
  const [month, setMonth] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
  });

  // filtro opcional por dia
  const [dayFilter, setDayFilter] = useState("");

  // dados para selects de laticínios (oficiais + meus)
  const [officialDairies, setOfficialDairies] = useState([]);
  const [myDairies, setMyDairies] = useState([]);

  // gráfico: exibir linha Total?
  const [showTotalLine, setShowTotalLine] = useState(false);

  // diálogo de lançamento/edição
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    date: todayLocalISO(),
    shift: "morning",
    liters: "",
    dairy_type: "official", // 'official' | 'mine'
    dairy_id: "",
    unit_price_at_sale: "",
    notes: "",
  });

  // 🔄 tick para forçar recomputar dados após salvar/editar/excluir
  const [refreshTick, setRefreshTick] = useState(0);

  // carregar fontes
  useEffect(() => {
    setOfficialDairies(storage.getDairies());
    setMyDairies(dairiesService.listMyDairies(user.id));
  }, [user.id]);

  // agregações do mês
  const bounds = useMemo(() => monthBounds(month), [month]);
  const daysAgg = useMemo(
    () => milkProduction.aggregateByDay(user.id, bounds),
    [user.id, bounds, refreshTick],
  );
  const monthTotals = useMemo(
    () => milkProduction.totalsForMonth(user.id, new Date(bounds.from)),
    [user.id, bounds, refreshTick],
  );

  // série do gráfico
  const chartData = useMemo(() => {
    const base = dayFilter ? daysAgg.filter((d) => d.date.slice(0, 10) === dayFilter) : daysAgg;

    return base.map((d) => ({
      date: fmtDate(d.date),
      Manhã: d.manha,
      Tarde: d.tarde,
      Total: d.total,
    }));
  }, [daysAgg, dayFilter]);

  // tabela/linhas do mês (com ou sem filtro de dia)
  const tableRows = useMemo(() => {
    const rows = dayFilter ? daysAgg.filter((d) => d.date.slice(0, 10) === dayFilter) : daysAgg;
    return [...rows].sort((a, b) => a.date.localeCompare(b.date)).reverse(); // mais recente em cima
  }, [daysAgg, dayFilter]);

  // pendências de hoje (banner)
  const todayStr = useMemo(() => todayLocalISO(), []);
  const pendingToday = useMemo(() => {
    const sameMonth = month === todayStr.slice(0, 7);
    if (!sameMonth || dayFilter) return { morning: false, afternoon: false, any: false };
    const today = daysAgg.find((d) => d.date === todayStr);
    const morning = !(today && today.items.some((i) => i.shift === "morning"));
    const afternoon = !(today && today.items.some((i) => i.shift === "afternoon"));
    return { morning, afternoon, any: morning || afternoon };
  }, [daysAgg, month, dayFilter, todayStr]);

  // abrir criação
  const openCreate = () => {
    setEditingItem(null);
    setForm({
      date: todayLocalISO(),
      shift: "morning",
      liters: "",
      dairy_type: "official",
      dairy_id: "",
      unit_price_at_sale: "",
      notes: "",
    });
    setOpenForm(true);
  };

  // abrir edição
  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      date: item.date,
      shift: item.shift,
      liters: String(item.liters),
      dairy_type: item.dairy_type,
      dairy_id: item.dairy_id,
      unit_price_at_sale: item.unit_price_at_sale != null ? String(item.unit_price_at_sale) : "",
      notes: item.notes || "",
    });
    setOpenForm(true);
  };

  // preencher preço automaticamente ao escolher laticínio/data/tipo
  useEffect(() => {
    if (!form.dairy_id || !form.date) return;
    let price = null;
    if (form.dairy_type === "official") {
      price = getOfficialPriceOnDate(form.dairy_id, form.date);
    } else {
      price = getMyDairyPriceOnDate(form.dairy_id, form.date);
    }
    if (price != null && form.unit_price_at_sale === "") {
      setForm((f) => ({ ...f, unit_price_at_sale: String(price) }));
    }
  }, [form.dairy_id, form.date, form.dairy_type]);

  const save = (e) => {
    e.preventDefault();
    if (!form.date || !form.shift || !form.liters) {
      toast({ title: "Preencha data, turno e litros.", variant: "destructive" });
      return;
    }
    const payload = {
      date: form.date, // YYYY-MM-DD
      shift: form.shift,
      liters: Number(form.liters),
      dairy_type: form.dairy_type,
      dairy_id: form.dairy_id || null,
      unit_price_at_sale: form.unit_price_at_sale !== "" ? Number(form.unit_price_at_sale) : null,
      notes: form.notes || "",
    };

    if (editingItem) {
      milkProduction.update(editingItem.id, payload);
      toast({ title: "Lançamento atualizado!" });
    } else {
      milkProduction.createOrUpdate(user.id, payload);
      toast({ title: "Lançamento salvo!" });
    }

    setOpenForm(false);
    setEditingItem(null);
    setRefreshTick((t) => t + 1);
    // 🔔 avisa o Layout para recalcular badges
    window.dispatchEvent(new CustomEvent("milktech:update-badges"));
  };

  // 🗑️ excluir lançamento
  const deleteEntry = (id) => {
    if (!id) return;
    if (!confirm("Excluir este lançamento?")) return;
    milkProduction.remove(id);
    toast({ title: "Lançamento removido." });
    setRefreshTick((t) => t + 1);
    window.dispatchEvent(new CustomEvent("milktech:update-badges"));
  };

  // Exportar CSV (opcional — já com data correta)
  const exportCSV = () => {
    const rows = milkProduction.aggregateByDay(user.id, bounds);
    const header = ["Data", "Manhã (L)", "Tarde (L)", "Total (L)", "Bruto (R$)"];
    const lines = [header.join(";")];
    rows.forEach((r) => {
      lines.push(
        [
          r.date, // já é YYYY-MM-DD
          r.manha,
          r.tarde,
          r.total,
          r.bruto.toFixed(2),
        ].join(";"),
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `producao_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Produção - MilkTech</title>
        <meta
          name="description"
          content="Registre a produção diária (manhã/tarde), visualize gráficos e exporte seus dados."
        />
      </Helmet>

      <div className="space-y-6">
        {/* Header + ações */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produção</h1>
            <p className="text-gray-600">
              Registre sua produção de <strong>Manhã</strong> e <strong>Tarde</strong> sem duplicar
              o dia.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
            </Button>
          </div>
        </div>

        {/* 🔔 Banner de pendências do dia */}
        {pendingToday.any && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-900">
              {pendingToday.morning && pendingToday.afternoon
                ? "Faltam os lançamentos de Manhã e Tarde de hoje."
                : pendingToday.morning
                  ? "Falta o lançamento de Manhã de hoje."
                  : "Falta o lançamento de Tarde de hoje."}
            </p>
            <div className="mt-2 flex gap-2">
              {pendingToday.morning && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingItem(null);
                    setForm((f) => ({ ...f, date: todayStr, shift: "morning", liters: "" }));
                    setOpenForm(true);
                  }}
                >
                  Lançar Manhã agora
                </Button>
              )}
              {pendingToday.afternoon && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingItem(null);
                    setForm((f) => ({ ...f, date: todayStr, shift: "afternoon", liters: "" }));
                    setOpenForm(true);
                  }}
                >
                  Lançar Tarde agora
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Filtros
            </CardTitle>
            <CardDescription>Escolha o mês e, se quiser, um dia específico.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Mês</Label>
              <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div>
              <Label>Dia (opcional)</Label>
              <Input
                type="date"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                min={`${month}-01`}
                max={`${month}-${String(new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate()).padStart(2, "0")}`}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={showTotalLine}
                  onChange={(e) => setShowTotalLine(e.target.checked)}
                />
                Mostrar linha “Total”
              </label>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Manhã (mês)</p>
              <p className="text-2xl font-bold">{monthTotals.manha} L</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Tarde (mês)</p>
              <p className="text-2xl font-bold">{monthTotals.tarde} L</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Total (mês)</p>
              <p className="text-2xl font-bold">{monthTotals.total} L</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">Bruto (mês)</p>
              <p className="text-2xl font-bold text-green-600">{toBRL(monthTotals.bruto)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Produção Diária
            </CardTitle>
            <CardDescription>Compare “Manhã” e “Tarde”. Ative “Total” se preferir.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Manhã" dot />
                <Line type="monotone" dataKey="Tarde" dot />
                {showTotalLine && (
                  <Line type="monotone" dataKey="Total" strokeDasharray="4 2" dot />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lista agregada por dia */}
        <div className="grid gap-4">
          {tableRows.map((d, idx) => (
            <motion.div
              key={d.date}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{fmtDate(d.date)}</span>
                    <span className="text-sm font-normal text-gray-500">
                      Total: <strong>{d.total} L</strong> • Bruto:{" "}
                      <strong className="text-green-600">{toBRL(d.bruto)}</strong>
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Manhã: <strong>{d.manha} L</strong> • Tarde: <strong>{d.tarde} L</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {d.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => openEdit(it)}>
                        <Edit className="h-3 w-3 mr-1" /> Editar{" "}
                        {it.shift === "morning" ? "Manhã" : "Tarde"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(it.id)}
                        title="Excluir lançamento"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {tableRows.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-gray-500">
                Sem lançamentos para o período.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Diálogo: criar/editar */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
            <DialogDescription>
              Um registro por dia/turno. Se existir, será atualizado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={save}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Turno</Label>
                <Select
                  value={form.shift}
                  onValueChange={(v) => setForm((f) => ({ ...f, shift: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Litros</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.liters}
                  onChange={(e) => setForm((f) => ({ ...f, liters: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Tipo de laticínio</Label>
                <Select
                  value={form.dairy_type}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, dairy_type: v, dairy_id: "", unit_price_at_sale: "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="official">Oficial</SelectItem>
                    <SelectItem value="mine">Meus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>
                  {form.dairy_type === "official" ? "Laticínio (oficial)" : "Meu Laticínio"}
                </Label>
                <Select
                  value={form.dairy_id}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, dairy_id: v, unit_price_at_sale: "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um laticínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {(form.dairy_type === "official" ? officialDairies : myDairies).map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.trade_name || d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preço do dia (R$/L)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.unit_price_at_sale}
                  onChange={(e) => setForm((f) => ({ ...f, unit_price_at_sale: e.target.value }))}
                  placeholder="Ex.: 2.15"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Preenche sozinho se houver histórico no laticínio.
                </p>
              </div>

              <div className="md:col-span-2">
                <Label>Observações (opcional)</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Ex.: chuva, vacas em cio, etc."
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="submit">{editingItem ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Production;
