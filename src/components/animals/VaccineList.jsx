import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";

export function VaccineList({ vaccines, onEditVaccine, onDeleteVaccine }) {
  const items = Array.isArray(vaccines) ? vaccines : [];

  const sorted = useMemo(() => {
    // mais recente primeiro
    return [...items].sort((a, b) => {
      const da = a?.applied_at ? new Date(a.applied_at).getTime() : 0;
      const db = b?.applied_at ? new Date(b.applied_at).getTime() : 0;
      return db - da;
    });
  }, [items]);

  if (sorted.length === 0) {
    return (
      <Card>
        <CardContent className="text-sm text-muted-foreground py-6">
          Sem vacinas registradas.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((v) => (
        <Card key={v.id}>
          <CardContent className="py-3 px-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-medium truncate">{v.name || "—"}</div>
              <div className="text-xs text-muted-foreground">
                Aplicada: {v.applied_at ? formatDate(v.applied_at) : "—"}
                {v.next_due_at ? ` • Próxima: ${formatDate(v.next_due_at)}` : ""}
              </div>
            </div>
            <div className="shrink-0 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditVaccine?.(v)}
                aria-label="Editar vacina"
                title="Editar vacina"
              >
                <Edit className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Tem certeza que deseja excluir esta vacina?")) {
                    onDeleteVaccine?.(v.id);
                  }
                }}
                aria-label="Excluir vacina"
                title="Excluir vacina"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
