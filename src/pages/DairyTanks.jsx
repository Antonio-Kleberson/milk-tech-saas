import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { storage } from "@/lib/storage";
import { toast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Truck, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

const DairyTanks = () => {
  const { user } = useAuth();
  const [tanks, setTanks] = useState([]);
  const [dairy, setDairy] = useState(null);
  const [tankForm, setTankForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    lat: "",
    lng: "",
    responsible_name: "",
    responsible_phone: "",
  });
  const [isTankDialogOpen, setIsTankDialogOpen] = useState(false);
  const [editingTank, setEditingTank] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    const dairies = storage.getDairies();
    const userDairy = dairies.find((d) => d.user_id === user.id);

    if (userDairy) {
      setDairy(userDairy);
      const dairyTanks = storage.getTanks().filter((t) => t.dairy_id === userDairy.id);
      setTanks(dairyTanks);
    }
  };

  const handleTankSubmit = (e) => {
    e.preventDefault();

    if (!dairy) {
      toast({
        title: "Erro",
        description: "Queijaria não encontrada. Complete seu cadastro primeiro.",
        variant: "destructive",
      });
      return;
    }

    const allTanks = storage.getTanks();

    if (editingTank) {
      const updatedTanks = allTanks.map((t) =>
        t.id === editingTank.id ? { ...t, ...tankForm } : t,
      );
      storage.setTanks(updatedTanks);
      toast({
        title: "Tanque atualizado com sucesso!",
      });
    } else {
      const newTank = {
        id: Date.now().toString(),
        dairy_id: dairy.id,
        ...tankForm,
        lat: tankForm.lat ? parseFloat(tankForm.lat) : null,
        lng: tankForm.lng ? parseFloat(tankForm.lng) : null,
        created_at: new Date().toISOString(),
      };
      allTanks.push(newTank);
      storage.setTanks(allTanks);
      toast({
        title: "Tanque cadastrado com sucesso!",
      });
    }

    setTankForm({
      name: "",
      address: "",
      city: "",
      state: "",
      lat: "",
      lng: "",
      responsible_name: "",
      responsible_phone: "",
    });
    setEditingTank(null);
    setIsTankDialogOpen(false);
    loadData();
  };

  const deleteTank = (tankId) => {
    const allTanks = storage.getTanks().filter((t) => t.id !== tankId);
    storage.setTanks(allTanks);

    toast({
      title: "Tanque removido com sucesso!",
    });
    loadData();
  };

  const editTank = (tank) => {
    setTankForm({
      name: tank.name,
      address: tank.address,
      city: tank.city,
      state: tank.state,
      lat: tank.lat?.toString() || "",
      lng: tank.lng?.toString() || "",
      responsible_name: tank.responsible_name,
      responsible_phone: tank.responsible_phone,
    });
    setEditingTank(tank);
    setIsTankDialogOpen(true);
  };

  const openInGoogleMaps = (tank) => {
    const query = encodeURIComponent(`${tank.address}, ${tank.city}, ${tank.state}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  if (!dairy) {
    return (
      <>
        <Helmet>
          <title>Gerenciar Tanques - MilkTech</title>
          <meta
            name="description"
            content="Cadastre e gerencie os tanques de coleta de leite da sua queijaria na plataforma MilkTech."
          />
          <meta property="og:title" content="Gerenciar Tanques - MilkTech" />
          <meta
            property="og:description"
            content="Cadastre e gerencie os tanques de coleta de leite da sua queijaria na plataforma MilkTech."
          />
        </Helmet>

        <div className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">
                Complete o cadastro da sua queijaria para gerenciar tanques
              </p>
              <Button
                className="mt-4"
                onClick={() =>
                  toast({
                    title:
                      "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀",
                  })
                }
              >
                Completar Cadastro
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gerenciar Tanques - MilkTech</title>
        <meta
          name="description"
          content="Cadastre e gerencie os tanques de coleta de leite da sua queijaria na plataforma MilkTech."
        />
        <meta property="og:title" content="Gerenciar Tanques - MilkTech" />
        <meta
          property="og:description"
          content="Cadastre e gerencie os tanques de coleta de leite da sua queijaria na plataforma MilkTech."
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Tanques</h1>
            <p className="text-gray-600">Tanques de coleta da {dairy.trade_name}</p>
          </div>

          <Dialog open={isTankDialogOpen} onOpenChange={setIsTankDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Novo Tanque
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTank ? "Editar Tanque" : "Cadastrar Novo Tanque"}</DialogTitle>
                <DialogDescription>Preencha os dados do tanque de coleta</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleTankSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="tank-name">Nome do Tanque</Label>
                    <Input
                      id="tank-name"
                      value={tankForm.name}
                      onChange={(e) => setTankForm({ ...tankForm, name: e.target.value })}
                      placeholder="Ex: Tanque Central SP"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={tankForm.address}
                      onChange={(e) => setTankForm({ ...tankForm, address: e.target.value })}
                      placeholder="Rua, número, bairro"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={tankForm.city}
                      onChange={(e) => setTankForm({ ...tankForm, city: e.target.value })}
                      placeholder="Nome da cidade"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={tankForm.state}
                      onChange={(e) => setTankForm({ ...tankForm, state: e.target.value })}
                      placeholder="SP"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="lat">Latitude (Opcional)</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      value={tankForm.lat}
                      onChange={(e) => setTankForm({ ...tankForm, lat: e.target.value })}
                      placeholder="-23.5505"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lng">Longitude (Opcional)</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      value={tankForm.lng}
                      onChange={(e) => setTankForm({ ...tankForm, lng: e.target.value })}
                      placeholder="-46.6333"
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsible-name">Nome do Responsável</Label>
                    <Input
                      id="responsible-name"
                      value={tankForm.responsible_name}
                      onChange={(e) =>
                        setTankForm({ ...tankForm, responsible_name: e.target.value })
                      }
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsible-phone">Telefone do Responsável</Label>
                    <Input
                      id="responsible-phone"
                      type="tel"
                      value={tankForm.responsible_phone}
                      onChange={(e) =>
                        setTankForm({ ...tankForm, responsible_phone: e.target.value })
                      }
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit">{editingTank ? "Atualizar" : "Cadastrar"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tanks List */}
        <div className="grid gap-6">
          {tanks.map((tank, index) => (
            <motion.div
              key={tank.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Truck className="h-5 w-5 mr-2 text-blue-600" />
                        {tank.name}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {tank.address}, {tank.city}, {tank.state}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openInGoogleMaps(tank)}>
                        Ver no Mapa
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => editTank(tank)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteTank(tank.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <p className="font-medium">{tank.responsible_name}</p>
                        <p className="text-sm text-gray-600">{tank.responsible_phone}</p>
                      </div>
                    </div>

                    {tank.lat && tank.lng && (
                      <div className="text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Coordenadas:</span>
                        </p>
                        <p>
                          Lat: {tank.lat}, Lng: {tank.lng}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {tanks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Nenhum tanque cadastrado</p>
                <p className="text-sm text-gray-400 mt-2">Clique em "Novo Tanque" para começar</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default DairyTanks;
