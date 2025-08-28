import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { formatDate, getDaysUntil } from "@/lib/dateUtils";

export const UpcomingVaccinesCard = ({ vaccines }) => {
  const items = Array.isArray(vaccines) ? vaccines : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-orange-600" aria-hidden="true" />
          Vacinas Próximas
        </CardTitle>
        <CardDescription>Próximas vacinas dos seus animais</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {items.map((vaccine) => {
            let d = getDaysUntil?.(vaccine?.next_due_at);
            // garante número e não-negativo para manter visual estável
            const daysUntil = Number.isFinite(d) ? Math.max(0, d) : 0;

            return (
              <div
                key={vaccine.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{vaccine?.animal?.name}</p>
                  <p className="text-sm text-gray-600">{vaccine?.name}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      daysUntil <= 7
                        ? "text-red-600"
                        : daysUntil <= 14
                          ? "text-orange-600"
                          : "text-green-600"
                    }`}
                  >
                    {daysUntil} {daysUntil === 1 ? "dia" : "dias"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate?.(vaccine?.next_due_at) || "—"}
                  </p>
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <p className="text-gray-500 text-center py-4">Nenhuma vacina próxima</p>
          )}
        </div>
        <div className="mt-4">
          <Button asChild variant="outline" className="w-full">
            <Link to="/animals">Gerenciar caderninho</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
