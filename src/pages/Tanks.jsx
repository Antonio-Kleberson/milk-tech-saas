import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { MapPin, ExternalLink, Search, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const Tanks = () => {
  const [tanks, setTanks] = useState([]);
  const [filteredTanks, setFilteredTanks] = useState([]);
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    loadTanks();
  }, []);

  useEffect(() => {
    filterTanks();
  }, [tanks, searchCity]);

  const loadTanks = () => {
    const allTanks = storage.getTanks();
    const dairies = storage.getDairies();

    const tanksWithDairies = allTanks.map((tank) => {
      const dairy = dairies.find((d) => d.id === tank.dairy_id);
      return { ...tank, dairy };
    });

    setTanks(tanksWithDairies);
  };

  const filterTanks = () => {
    const term = (searchCity || '').trim().toLowerCase();
    if (!term) {
      setFilteredTanks(tanks);
      return;
    }
    const filtered = tanks.filter((tank) => {
      const city = (tank.city || '').toLowerCase();
      const state = (tank.state || '').toLowerCase();
      return city.includes(term) || state.includes(term);
    });
    setFilteredTanks(filtered);
  };

  const openInGoogleMaps = (tank) => {
    const addr = [tank.address, tank.city, tank.state].filter(Boolean).join(', ');
    const query = encodeURIComponent(addr || tank.name || 'Tanque de leite');
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>Tanques de Coleta - MilkTech</title>
        <meta
          name="description"
          content="Encontre tanques de coleta de leite próximos à sua propriedade e facilite a logística da sua produção."
        />
        <meta property="og:title" content="Tanques de Coleta - MilkTech" />
        <meta
          property="og:description"
          content="Encontre tanques de coleta de leite próximos à sua propriedade e facilite a logística da sua produção."
        />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tanques de Coleta</h1>
          <p className="text-gray-600">Encontre tanques de coleta próximos à sua propriedade</p>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Buscar Tanques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search-city">Buscar por cidade ou estado</Label>
                <Input
                  id="search-city"
                  placeholder="Digite a cidade ou estado..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid gap-6">
          {filteredTanks.map((tank, index) => (
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
                      <CardTitle className="text-xl">{tank.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {[tank.address, tank.city, tank.state].filter(Boolean).join(', ') || 'Endereço não informado'}
                      </CardDescription>
                      {tank.dairy && (
                        <p className="text-sm text-gray-600 mt-1">
                          Queijaria: {tank.dairy.trade_name}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => openInGoogleMaps(tank)} className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver no Mapa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <div>
                          <p className="font-medium">{tank.responsible_name || '—'}</p>
                          <p className="text-sm text-gray-600">{tank.responsible_phone || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {tank.dairy && (
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">CNPJ:</span> {tank.dairy.cnpj || '—'}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Telefone:</span> {tank.dairy.phone || '—'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filteredTanks.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">
                  {searchCity ? 'Nenhum tanque encontrado para esta busca' : 'Nenhum tanque cadastrado'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Tanks;
