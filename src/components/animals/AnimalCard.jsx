// src/components/animals/AnimalCard.jsx
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Syringe } from "lucide-react";
import { motion } from "framer-motion";
import { VaccineList } from "@/components/animals/VaccineList";
import { formatDate, calculateAge } from "@/lib/dateUtils";

// util BRL
const toBRL = (n) => `R$ ${Number(n || 0).toFixed(2)}`;

export const AnimalCard = ({
  animal,
  vaccines,
  movements = [],
  reproEvents = [],
  reproState, // { status, service?, diagnosis?, dpp? } (opcional)
  onEditAnimal,
  onDeleteAnimal,
  onAddVaccine,
  onEditVaccine,
  onDeleteVaccine,
  onAddMovement,
  onEditMovement,
  onDeleteMovement,
  onAddRepro,
  onEditRepro,
  onDeleteRepro,
  index,
}) => {
  const items = Array.isArray(vaccines) ? vaccines : [];
  const birthDate = animal?.birth_date ?? null;
  const ageText = birthDate ? calculateAge(birthDate) : "—";
  const birthText = birthDate ? formatDate(birthDate) : "—";

  const lastMovs = Array.isArray(movements)
    ? [...movements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
    : [];

  // estado reprodutivo simples
  const repro = reproState || null;

  return (
    <motion.div
      key={animal.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
            <div>
              <CardTitle className="flex items-center flex-wrap gap-2">
                {animal.name}
                <Badge variant="secondary">Brinco: {animal.earring}</Badge>
                {animal.status && animal.status !== "ativo" && (
                  <Badge variant="destructive">{animal.status}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {animal.breed} • {ageText} • Nascido em {birthText}
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddVaccine?.(animal)}
                title="Adicionar vacina"
              >
                <Syringe className="h-4 w-4 mr-1" aria-hidden="true" />
                Vacina
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddMovement?.(animal)}
                title="Registrar movimentação"
              >
                Mov.
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddRepro?.(animal)}
                title="Registrar evento reprodutivo"
              >
                Repro.
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditAnimal?.(animal)}
                title="Editar animal"
              >
                <Edit className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Tem certeza que deseja excluir este animal?"))
                    onDeleteAnimal?.(animal.id);
                }}
                title="Excluir animal"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* resumo reprodutivo */}
        {repro && (
          <CardContent className="pt-0">
            <div className="rounded-md border p-3 text-sm bg-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">Reprodução:</span>
                {repro.status === "prenhe" && (
                  <>
                    <Badge className="bg-green-600 text-white">Prenhe</Badge>
                    {repro.dpp && (
                      <span>
                        DPP: <strong>{formatDate(repro.dpp)}</strong>
                      </span>
                    )}
                  </>
                )}
                {repro.status === "servida" && (
                  <Badge className="bg-amber-500 text-white">Servida</Badge>
                )}
                {repro.status === "vazia" && <Badge>Vazia</Badge>}
              </div>
              <div className="mt-1 text-gray-600">
                {repro.service && <>Última IA/Cobertura: {formatDate(repro.service.date)}. </>}
                {repro.diagnosis && (
                  <>
                    Último diagnóstico: {repro.diagnosis.result} em{" "}
                    {formatDate(repro.diagnosis.date)}.
                  </>
                )}
              </div>
            </div>
          </CardContent>
        )}

        {/* últimos movimentos */}
        {lastMovs.length > 0 && (
          <CardContent className="pt-0">
            <div className="rounded-md border p-3 text-sm bg-white">
              <div className="font-semibold mb-2">Movimentações recentes</div>
              <ul className="space-y-1">
                {lastMovs.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2">
                    <span className="text-gray-700">
                      {formatDate(m.date)} — {m.type}
                      {(m.type === "compra" || m.type === "venda") && m.amount != null && (
                        <> • {toBRL(m.amount)}</>
                      )}
                    </span>
                    <div className="shrink-0 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditMovement?.(m)}
                        title="Editar"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteMovement?.(m.id)}
                        title="Excluir"
                      >
                        Excluir
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}

        {/* vacinas */}
        {items.length > 0 && (
          <CardContent className="pt-0">
            <VaccineList
              vaccines={items}
              onEditVaccine={onEditVaccine}
              onDeleteVaccine={onDeleteVaccine}
            />
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};
