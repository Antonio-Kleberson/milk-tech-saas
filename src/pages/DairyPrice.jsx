import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const DairyPrice = () => {
  const { user } = useAuth();
  const [currentPrice, setCurrentPrice] = useState('');
  const [priceHistory, setPriceHistory] = useState([]);
  const [dairy, setDairy] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = () => {
    const dairies = storage.getDairies();
    const userDairy = dairies.find(d => d.user_id === user.id);
    
    if (userDairy) {
      setDairy(userDairy);
      
      const prices = storage.getMilkPrices()
        .filter(p => p.dairy_id === userDairy.id)
        .sort((a, b) => new Date(b.effective_at) - new Date(a.effective_at));
      
      setPriceHistory(prices);
      
      if (prices.length > 0) {
        setCurrentPrice(prices[0].price_per_liter.toString());
      }
    }
  };

  const handlePriceUpdate = (e) => {
    e.preventDefault();
    
    const price = parseFloat(currentPrice);
    
    if (price < 0.50 || price > 5.00) {
      toast({
        title: 'Erro',
        description: 'O preço deve estar entre R$ 0,50 e R$ 5,00',
        variant: 'destructive',
      });
      return;
    }

    if (!dairy) {
      toast({
        title: 'Erro',
        description: 'Queijaria não encontrada. Complete seu cadastro primeiro.',
        variant: 'destructive',
      });
      return;
    }

    const allPrices = storage.getMilkPrices();
    const newPrice = {
      id: Date.now().toString(),
      dairy_id: dairy.id,
      price_per_liter: price,
      effective_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    allPrices.push(newPrice);
    storage.setMilkPrices(allPrices);

    toast({
      title: 'Preço atualizado com sucesso!',
      description: `Novo preço: R$ ${price.toFixed(2)} por litro`,
    });

    loadData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysAgo = (dateString) => {
    const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (!dairy) {
    return (
      <>
        <Helmet>
          <title>Gerenciar Preço - MilkTech</title>
          <meta name="description" content="Defina e atualize o preço do leite da sua queijaria na plataforma MilkTech." />
          <meta property="og:title" content="Gerenciar Preço - MilkTech" />
          <meta property="og:description" content="Defina e atualize o preço do leite da sua queijaria na plataforma MilkTech." />
        </Helmet>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">
                Complete o cadastro da sua queijaria para gerenciar preços
              </p>
              <Button 
                className="mt-4"
                onClick={() => toast({
                  title: '🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀'
                })}
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
        <title>Gerenciar Preço - MilkTech</title>
        <meta name="description" content="Defina e atualize o preço do leite da sua queijaria na plataforma MilkTech." />
        <meta property="og:title" content="Gerenciar Preço - MilkTech" />
        <meta property="og:description" content="Defina e atualize o preço do leite da sua queijaria na plataforma MilkTech." />
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Preço do Leite</h1>
          <p className="text-gray-600">Atualize o preço do leite da {dairy.trade_name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Update Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Atualizar Preço
                </CardTitle>
                <CardDescription>
                  Defina o novo preço por litro do leite
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePriceUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="price">Preço por litro (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0.50"
                      max="5.00"
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      placeholder="Ex: 2.15"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valor deve estar entre R$ 0,50 e R$ 5,00
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Atualizar Preço
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current Price Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Preço Atual
                </CardTitle>
                <CardDescription>
                  Preço vigente do leite
                </CardDescription>
              </CardHeader>
              <CardContent>
                {priceHistory.length > 0 ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      R$ {priceHistory[0].price_per_liter.toFixed(2)}
                    </div>
                    <div className="text-lg text-gray-600 mb-4">por litro</div>
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Atualizado há {getDaysAgo(priceHistory[0].effective_at)} dias
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(priceHistory[0].effective_at)}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum preço definido</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Defina o primeiro preço do leite
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Price History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Preços</CardTitle>
              <CardDescription>
                Últimas atualizações de preço
              </CardDescription>
            </CardHeader>
            <CardContent>
              {priceHistory.length > 0 ? (
                <div className="space-y-3">
                  {priceHistory.slice(0, 10).map((price, index) => (
                    <div key={price.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">R$ {price.price_per_liter.toFixed(2)} por litro</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(price.effective_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {getDaysAgo(price.effective_at)} dias atrás
                        </p>
                        {index === 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Atual
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum histórico de preços</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default DairyPrice;