// src/components/animals/AnimalCard.jsx
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Syringe, AlertTriangle } from "lucide-react";
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

  // verifica se precisa de brinco
  const needsEarring = animal.needs_earring || (!animal.earring && animal.earring !== "0");
  const earringDisplay = animal.earring || "Sem numeração";

  return (
    <motion.div
      key={animal.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.1 }}
    >
      <Card className={needsEarring ? "border-amber-200 bg-amber-50/30" : ""}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
            <div>
              <CardTitle className="flex items-center flex-wrap gap-2">
                {animal.name}
                
                {/* Badge do brinco com alerta se necessário */}
                <Badge 
                  variant={needsEarring ? "destructive" : "secondary"}
                  className={needsEarring ? "bg-amber-100 text-amber-800 border-amber-300" : ""}
                >
                  {needsEarring && <AlertTriangle className="h-3 w-3 mr-1" />}
                  Brinco: {earringDisplay}
                </Badge>

                {/* Status do animal */}
                {animal.status && animal.status !== "ativo" && (
                  <Badge variant="destructive">{animal.status}</Badge>
                )}
              </CardTitle>
              
              <CardDescription>
                {animal.breed} • {ageText} • Nascido em {birthText}
                {needsEarring && (
                  <span className="text-amber-600 font-medium ml-2">
                    • Pendente numeração
                  </span>
                )}
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
                title={needsEarring ? "Editar animal (adicionar brinco)" : "Editar animal"}
                className={needsEarring ? "border-amber-300 text-amber-700 hover:bg-amber-50" : ""}
              >
                <Edit className="h-4 w-4" aria-hidden="true" />
                {needsEarring && <span className="ml-1 hidden sm:inline">Brinco</span>}
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

        {/* Alerta de brinco pendente */}
        {needsEarring && (
          <CardContent className="pt-0">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Numeração pendente</span>
              </div>
              <p className="mt-1 text-amber-700">
                Este animal ainda não possui numeração de brinco registrada.{" "}
                <button
                  onClick={() => onEditAnimal?.(animal)}
                  className="underline hover:no-underline font-medium"
                >
                  Clique aqui para adicionar
                </button>
                .
              </p>
            </div>
          </CardContent>
        )}

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