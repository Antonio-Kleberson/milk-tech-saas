import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { MapPin, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { getDaysAgo, formatDate } from '@/lib/dateUtils';

const Prices = () => {
  const [dairiesWithPrices, setDairiesWithPrices] = useState([]);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = () => {
    const dairies = storage.getDairies();
    const prices = storage.getMilkPrices();

    const data = dairies.map(dairy => {
      const latestPrice = prices
        .filter(p => p.dairy_id === dairy.id)
        .sort((a, b) => new Date(b.effective_at) - new Date(a.effective_at))[0];

      return {
        ...dairy,
        price: latestPrice?.price_per_liter || 0,
        lastUpdated: latestPrice?.effective_at,
        daysAgo: getDaysAgo(latestPrice?.effective_at)
      };
    }).sort((a, b) => b.price - a.price);

    setDairiesWithPrices(data);
  };

  const openInGoogleMaps = (dairy) => {
    const addr = [dairy.address, dairy.city, dairy.state].filter(Boolean).join(', ');
    const query = encodeURIComponent(addr || dairy.trade_name);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>Preços do Leite - MilkTech</title>
        <meta name="description" content="Compare os preços do leite oferecidos pelas queijarias da sua região e encontre as melhores oportunidades." />
        <meta property="og:title" content="Preços do Leite - MilkTech" />
        <meta property="og:description" content="Compare os preços do leite oferecidos pelas queijarias da sua região e encontre as melhores oportunidades." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Preços do Leite</h1>
          <p className="text-gray-600">Compare os preços oferecidos pelas queijarias da região</p>
        </div>

        <div className="grid gap-6">
          {dairiesWithPrices.map((dairy, index) => (
            <motion.div
              key={dairy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                    <div className="mb-4 sm:mb-0">
                      <CardTitle className="text-xl">{dairy.trade_name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {[dairy.address, dairy.city, dairy.state].filter(Boolean).join(', ') || 'Endereço não informado'}
                      </CardDescription>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-3xl font-bold text-green-600">
                        R$ {dairy.price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">por litro</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div className="flex items-center text-sm text-gray-600 mb-2 sm:mb-0">
                      <Clock className="h-4 w-4 mr-1" />
                      {dairy.lastUpdated ? (
                        <span>
                          Atualizado há {dairy.daysAgo} {dairy.daysAgo === 1 ? 'dia' : 'dias'}
                          ({formatDate(dairy.lastUpdated)})
                        </span>
                      ) : (
                        <span>Preço não informado</span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInGoogleMaps(dairy)}
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver no Mapa
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">CNPJ:</span> {dairy.cnpj || '—'}
                      </div>
                      <div>
                        <span className="font-medium">Telefone:</span> {dairy.phone || '—'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {dairiesWithPrices.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Nenhuma queijaria encontrada</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Prices;