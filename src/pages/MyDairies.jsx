// src/pages/MyDairies.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dairiesService } from "@/lib/dairies.service";
import { Helmet } from "react-helmet-async";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, Edit, Trash2, Plus, MapPin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/dateUtils";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const MyDairies = () => {
  const { user } = useAuth();
  const [dairies, setDairies] = useState([]);
  const [pricesByDairy, setPricesByDairy] = useState({});
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    phone: "",
    responsavel: "",
    address: "",
    city: "",
    state: "",
  });

  const [openPrice, setOpenPrice] = useState(false);
  const [priceForm, setPriceForm] = useState({ dairy_id: "", price: "", date: "" });

  // gráfico on/off por laticínio
  const [showChart, setShowChart] = useState({});
  const toggleChart = (id) => setShowChart((prev) => ({ ...prev, [id]: !prev[id] }));

  // editar preço
  const [openEditPrice, setOpenEditPrice] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);

  const load = () => {
    const list = dairiesService.listMyDairies(user.id);
    setDairies(list);
    const map = {};
    list.forEach((d) => {
      map[d.id] = dairiesService.listMyDairyPrices(d.id);
    });
    setPricesByDairy(map);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user.id]);

  // abrir no Google Maps
  const openInGoogleMaps = (d) => {
    const addressStr = [d.address, d.city, d.state].filter(Boolean).join(", ");
    if (!addressStr) return;
    const q = encodeURIComponent(addressStr);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };

  // ---- CRUD Laticínios
  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      cnpj: "",
      phone: "",
      responsavel: "",
      address: "",
      city: "",
      state: "",
    });
    setOpenForm(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      name: d.name || "",
      cnpj: d.cnpj || "",
      phone: d.phone || "",
      responsavel: d.responsavel || "",
      address: d.address || "",
      city: d.city || "",
      state: d.state || "",
    });
    setOpenForm(true);
  };

  const saveDairy = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Informe o nome do laticínio", variant: "destructive" });
      return;
    }
    if (editing) {
      dairiesService.updateMyDairy(editing.id, form);
      toast({ title: "Laticínio atualizado!" });
    } else {
      dairiesService.createMyDairy(user.id, form);
      toast({ title: "Laticínio criado!" });
    }
    setOpenForm(false);
    setEditing(null);
    load();
  };

  const removeDairy = (id) => {
    dairiesService.deleteMyDairy(id);
    toast({ title: "Laticínio removido!" });
    load();
  };

  // ---- Preços (novo lançamento)
  const openPriceDialog = (dairy) => {
    setPriceForm({ dairy_id: dairy.id, price: "", date: "" });
    setOpenPrice(true);
  };

  const savePrice = (e) => {
    e.preventDefault();
    const val = Number(priceForm.price);
    if (!val || val <= 0) {
      toast({ title: "Preço inválido", variant: "destructive" });
      return;
    }
    dairiesService.addMyDairyPrice(priceForm.dairy_id, {
      price: val,
      date: priceForm.date || new Date().toISOString(),
    });
    toast({ title: "Preço registrado!" });
    setOpenPrice(false);
    load();
  };

  // ---- Editar preço existente
  const openEditPriceDialog = (dairyId, price) => {
    setEditingPrice({
      dairyId,
      priceId: price.id,
      price: price.price_per_liter.toFixed(2),
      date: (price.effective_at || "").slice(0, 10),
    });
    setOpenEditPrice(true);
  };

  const saveEditedPrice = (e) => {
    e.preventDefault();
    const val = Number(editingPrice.price);
    if (!val || val <= 0) {
      toast({ title: "Preço inválido", variant: "destructive" });
      return;
    }
    dairiesService.updateMyDairyPrice(editingPrice.dairyId, editingPrice.priceId, {
      price: val,
      date: editingPrice.date,
    });
    toast({ title: "Preço atualizado!" });
    setOpenEditPrice(false);
    setEditingPrice(null);
    load();
  };

  return (
    <>
      <Helmet>
        <title>Meus Laticínios - MilkTech</title>
        <meta
          name="description"
          content="Cadastre seus laticínios, lance preços pessoais e acompanhe o histórico."
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Laticínios</h1>
            <p className="text-gray-600">Cadastre seus contatos e registre seus preços.</p>
          </div>
          <Button onClick={openCreate} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" /> Novo Laticínio
          </Button>
        </div>

        <div className="grid gap-6">
          {dairies.map((d, idx) => {
            const prices = pricesByDairy[d.id] || [];
            const latest = prices[0];
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div>
                        <CardTitle className="flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                          {d.name}
                        </CardTitle>
                        <CardDescription className="space-x-1 break-words">
                          {d.cnpj ? <>CNPJ: {d.cnpj} • </> : null}
                          {d.phone ? <>Telefone: {d.phone} • </> : null}
                          {d.responsavel ? <>Resp.: {d.responsavel}</> : null}
                        </CardDescription>
                        {(d.address || d.city || d.state) && (
                          <p className="text-sm text-gray-600 flex items-center mt-1 break-words">
                            <MapPin className="h-3 w-3 mr-1" />
                            {[d.address, d.city, d.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(d.address || d.city || d.state) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInGoogleMaps(d)}
                            className="flex items-center"
                            title="Abrir no Google Maps"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver no Mapa
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full xs:w-auto"
                          onClick={() => toggleChart(d.id)}
                        >
                          {showChart[d.id] ? "Ocultar Gráfico" : "Gráfico"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full xs:w-auto"
                          onClick={() => openPriceDialog(d)}
                        >
                          Lançar Preço
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full xs:w-auto"
                          onClick={() => openEdit(d)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full xs:w-auto"
                          onClick={() => removeDairy(d.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* gráfico opcional */}
                    {showChart[d.id] && prices.length > 0 && (
                      <div className="w-full h-40 sm:h-56 mb-6 bg-white">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={[...prices]
                              .sort((a, b) => new Date(a.effective_at) - new Date(b.effective_at))
                              .map((p) => ({
                                date: formatDate(p.effective_at),
                                price: p.price_per_liter,
                              }))}
                            margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 11 }}
                              interval="preserveStartEnd"
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="price" dot />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {latest ? (
                      <div className="mb-4">
                        <p className="text-lg">
                          <span className="font-semibold">Preço atual:</span>{" "}
                          <span className="text-green-600 font-bold">
                            R$ {latest.price_per_liter.toFixed(2)}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {" "}
                            • {formatDate(latest.effective_at)}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 mb-4">Sem preço registrado.</p>
                    )}

                    {prices.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Histórico recente</p>
                        <div className="space-y-2">
                          {prices.slice(0, 6).map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <span>R$ {p.price_per_liter.toFixed(2)} / L</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {formatDate(p.effective_at)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="px-2"
                                  onClick={() => openEditPriceDialog(d.id, p)}
                                  title="Editar preço"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {dairies.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Nenhum laticínio cadastrado.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Clique em “Novo Laticínio” para começar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog: criar/editar laticínio */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Laticínio" : "Novo Laticínio"}</DialogTitle>
            <DialogDescription>Registre dados básicos. CNPJ é opcional.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveDairy}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                <Input
                  id="cnpj"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="responsavel">Responsável (opcional)</Label>
                <Input
                  id="responsavel"
                  value={form.responsavel}
                  onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Endereço (opcional)</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Rua, número, bairro"
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade (opcional)</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado (opcional)</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="submit">{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: lançar preço */}
      <Dialog open={openPrice} onOpenChange={setOpenPrice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lançar Preço</DialogTitle>
            <DialogDescription>Registre o preço por litro e a data (opcional).</DialogDescription>
          </DialogHeader>
          <form onSubmit={savePrice}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="price">Preço por litro (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceForm.price}
                  onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Data (opcional)</Label>
                <Input
                  id="date"
                  type="date"
                  value={priceForm.date}
                  onChange={(e) => setPriceForm({ ...priceForm, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: editar preço */}
      <Dialog open={openEditPrice} onOpenChange={setOpenEditPrice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Preço</DialogTitle>
            <DialogDescription>Ajuste o valor e/ou a data.</DialogDescription>
          </DialogHeader>
          <form onSubmit={saveEditedPrice}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="edit-price">Preço por litro (R$)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingPrice?.price || ""}
                  onChange={(e) => setEditingPrice((ep) => ({ ...ep, price: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-date">Data</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingPrice?.date || ""}
                  onChange={(e) => setEditingPrice((ep) => ({ ...ep, date: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se houver lançamento na mesma data, o sistema mantém um único registro (o mais
                  recente).
                </p>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyDairies;
