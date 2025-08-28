import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Truck, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const DairyDashboard = ({ user }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard da Queijaria</h1>
        <p className="text-gray-600">
          Bem-vindo, {user?.name || "usuário"}! Gerencie sua queijaria aqui.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={0}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" aria-hidden="true" />
                Atualizar Preço
              </CardTitle>
              <CardDescription>Defina o preço atual do leite</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link
                  to="/dairy-price"
                  aria-label="Ir para Gerenciar Preço"
                  title="Gerenciar Preço"
                >
                  Gerenciar Preço
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true" />
                Gerenciar Tanques
              </CardTitle>
              <CardDescription>Cadastre e gerencie tanques de coleta</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link
                  to="/dairy-tanks"
                  aria-label="Ir para Gerenciar Tanques"
                  title="Gerenciar Tanques"
                >
                  Gerenciar Tanques
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} initial="hidden" animate="visible" custom={2}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" aria-hidden="true" />
                Relatórios
              </CardTitle>
              <CardDescription>Visualize estatísticas e relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  toast({
                    title:
                      "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀",
                  })
                }
                aria-label="Relatórios (em breve)"
                title="Relatórios (em breve)"
              >
                Em Breve
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
