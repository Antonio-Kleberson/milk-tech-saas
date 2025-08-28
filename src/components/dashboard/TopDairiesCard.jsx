import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, MapPin } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";

export const TopDairiesCard = ({ dairies }) => {
  const items = Array.isArray(dairies) ? dairies : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-600" aria-hidden="true" />
          Top Queijeiras por Preço
        </CardTitle>
        <CardDescription>Melhores preços do leite na sua região</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {items.map((dairy) => {
            const priceNum = Number(dairy?.price);
            return (
              <div
                key={dairy.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{dairy.trade_name}</p>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" aria-hidden="true" />
                    {dairy.city}, {dairy.state}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    R$ {(Number.isFinite(priceNum) ? priceNum : 0).toFixed(2)}/L
                  </p>
                  <p className="text-xs text-gray-500">
                    {dairy.lastUpdated ? formatDate(dairy.lastUpdated) : "N/A"}
                  </p>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <p className="text-gray-500 text-center py-4">Nenhuma queijeira encontrada</p>
          )}
        </div>
        <div className="mt-4">
          <Button asChild variant="outline" className="w-full">
            <Link to="/prices">Ver todos os preços</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
