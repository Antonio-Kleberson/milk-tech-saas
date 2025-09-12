// src/pages/Animals.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { toast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { AnimalCard } from "@/components/animals/AnimalCard";
import { AnimalDialog } from "@/components/animals/AnimalDialog";
import { VaccineDialog } from "@/components/animals/VaccineDialog";
import { MovementDialog } from "@/components/animals/MovementDialog";
import { ReproDialog } from "@/components/animals/ReproDialog";
import { Card, CardContent } from "@/components/ui/card";

import { animalMovements } from "@/lib/animal-movements.service";
import { animalRepro } from "@/lib/animal-repro.service";

const [pendingEarringCount, setPendingEarringCount] = useState(0);

const Animals = () => {
  const { user } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [movements, setMovements] = useState([]);
  const [repros, setRepros] = useState([]);

  const [modalState, setModalState] = useState({
    animal: false,
    vaccine: false,
    movement: false,
    repro: false,

    editingAnimal: null,
    editingVaccine: null,
    editingMovement: null,
    editingRepro: null,

    currentAnimalForVaccine: null,
    currentAnimalForMovement: null,
    currentAnimalForRepro: null,
  });

  const loadData = useCallback(() => {
    const allAnimals = storage.getAnimals().filter((a) => a.owner_id === user.id);
    const allVaccines = storage.getVaccines();
    const allMovs = animalMovements.list();
    const allRepros = animalRepro.list();

    setAnimals(allAnimals);
    setVaccines(allVaccines);
    setMovements(allMovs);
    setRepros(allRepros);

    //calcula quantos animais estão sem brinco
    const noEarring = allAnimals.filter((a) => !a.earring || a.earring.trim() === "").length;
    setPendingEarringCount(noEarring);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openModal = (type, data = {}) => {
    setModalState((prev) => ({ ...prev, [type]: true, ...data }));
  };
  const closeModal = (type) => {
    setModalState((prev) => ({
      ...prev,
      [type]: false,
      editingAnimal: null,
      editingVaccine: null,
      editingMovement: null,
      editingRepro: null,
      currentAnimalForVaccine: null,
      currentAnimalForMovement: null,
      currentAnimalForRepro: null,
    }));
  };

  // --- validação brinco único
  const validateEarring = (earring, ignoreId) => {
    const existingAnimals = storage.getAnimals().filter((a) => a.owner_id === user.id);
    const exists = existingAnimals.some((a) => a.earring === earring && a.id !== ignoreId);
    return !exists;
  };

  // --- CRUD Animal
  const handleAnimalSubmit = (formData) => {
    const existingAnimals = storage.getAnimals().filter((a) => a.owner_id === user.id);
    const earringExists = existingAnimals.some(
      (a) =>
        a.earring === formData.earring &&
        (!modalState.editingAnimal || a.id !== modalState.editingAnimal.id),
    );
    if (earringExists) {
      toast({
        title: "Erro",
        description: "Já existe um animal com este número de brinco.",
        variant: "destructive",
      });
      return;
    }

    const allAnimals = storage.getAnimals();
    if (modalState.editingAnimal) {
      const updatedAnimals = allAnimals.map((a) =>
        a.id === modalState.editingAnimal.id
          ? { ...a, ...formData, updated_at: new Date().toISOString() }
          : a,
      );
      storage.setAnimals(updatedAnimals);
      toast({ title: "Sucesso!", description: "Animal atualizado com sucesso!" });
    } else {
      const newAnimal = {
        id: Date.now().toString(),
        owner_id: user.id,
        status: "ativo",
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      storage.setAnimals([...allAnimals, newAnimal]);
      toast({ title: "Sucesso!", description: "Animal cadastrado com sucesso!" });
    }
    closeModal("animal");
    loadData();
  };

  // --- CRUD Vacina
  const handleVaccineSubmit = (formData) => {
    const allVaccines = storage.getVaccines();
    if (modalState.editingVaccine) {
      const updated = allVaccines.map((v) =>
        v.id === modalState.editingVaccine.id ? { ...v, ...formData } : v,
      );
      storage.setVaccines(updated);
      toast({ title: "Sucesso!", description: "Vacina atualizada com sucesso!" });
    } else {
      const newVaccine = {
        id: Date.now().toString(),
        animal_id: modalState.currentAnimalForVaccine.id,
        ...formData,
        created_at: new Date().toISOString(),
      };
      storage.setVaccines([...allVaccines, newVaccine]);
      toast({ title: "Sucesso!", description: "Vacina registrada com sucesso!" });
    }
    closeModal("vaccine");
    loadData();
  };

  // --- CRUD Movimentações
  const handleMovementSubmit = (formData) => {
    const animal = modalState.currentAnimalForMovement;
    if (!animal) return;

    if (modalState.editingMovement) {
      animalMovements.update(modalState.editingMovement.id, formData);
      toast({ title: "Sucesso!", description: "Movimentação atualizada!" });
    } else {
      animalMovements.create({ animal_id: animal.id, ...formData });
      toast({ title: "Sucesso!", description: "Movimentação registrada!" });
    }

    // Atualiza status do animal para óbito/transferência
    if (formData.type === "obito" || formData.type === "transferencia") {
      const all = storage.getAnimals();
      const next = all.map((a) =>
        a.id === animal.id
          ? {
              ...a,
              status: formData.type === "obito" ? "inativo" : "transferido",
              updated_at: new Date().toISOString(),
            }
          : a,
      );
      storage.setAnimals(next);
    }

    closeModal("movement");
    loadData();
  };

  // --- CRUD Reprodução
  const handleReproSubmit = (formData) => {
    const animal = modalState.currentAnimalForRepro;
    if (!animal) return;

    if (modalState.editingRepro) {
      animalRepro.update(modalState.editingRepro.id, formData);
      toast({ title: "Sucesso!", description: "Evento reprodutivo atualizado!" });
    } else {
      animalRepro.create({ animal_id: animal.id, ...formData });
      toast({ title: "Sucesso!", description: "Evento reprodutivo registrado!" });
    }
    closeModal("repro");
    loadData();
  };

  // --- Deletar (animal / vacina / movimento / repro)
  const deleteItem = (type, id) => {
    if (type === "animal") {
      // Exclui animal e cascata
      const animal = storage.getAnimals().find((a) => a.id === id);
      if (!animal) return;
      storage.setAnimals(storage.getAnimals().filter((a) => a.id !== id));
      storage.setVaccines(storage.getVaccines().filter((v) => v.animal_id !== id));
      animalMovements.removeByAnimal(id);
      animalRepro.removeByAnimal(id);
      toast({ title: "Sucesso!", description: "Animal e seus registros foram removidos." });
    } else if (type === "vaccine") {
      storage.setVaccines(storage.getVaccines().filter((v) => v.id !== id));
      toast({ title: "Sucesso!", description: "Vacina removida com sucesso." });
    } else if (type === "movement") {
      animalMovements.remove(id);
      toast({ title: "Sucesso!", description: "Movimentação removida." });
    } else if (type === "repro") {
      animalRepro.remove(id);
      toast({ title: "Sucesso!", description: "Evento reprodutivo removido." });
    }
    loadData();
  };

  // Helpers por animal (para passar ao card)
  const vaccinesOf = (animalId) => vaccines.filter((v) => v.animal_id === animalId);
  const movementsOf = (animalId) => movements.filter((m) => m.animal_id === animalId);
  const reprosOf = (animalId) => repros.filter((r) => r.animal_id === animalId);
  const reproStateOf = (animalId) => animalRepro.state(animalId);

  return (
    <>
      <Helmet>
        <title>Caderninho de Animais - MilkTech</title>
        <meta
          name="description"
          content="Gerencie seus animais e controle de vacinas, movimentações e reprodução."
        />
        <meta property="og:title" content="Caderninho de Animais - MilkTech" />
        <meta
          property="og:description"
          content="Gerencie seus animais e controle de vacinas, movimentações e reprodução."
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Caderninho de Animais</h1>
            <p className="text-gray-600">
              Gerencie seus animais, vacinas, movimentações e reprodução.
            </p>
          </div>
          <Button onClick={() => openModal("animal")}>
            <Plus className="h-4 w-4 mr-2" /> Novo Animal
          </Button>
        </div>

        {pendingEarringCount > 0 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-amber-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1 text-sm text-amber-800">
              Você tem <strong>{pendingEarringCount}</strong>{" "}
              {pendingEarringCount === 1 ? "animal" : "animais"} sem numeração de brinco.
              <div className="mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={() => {
                    // rolar até a lista ou no futuro aplicar um filtro de "pendentes"
                    const el = document.getElementById("animals-list");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Ver animais
                </Button>
              </div>
            </div>
          </div>
        )}

        <div id="animals-list" className="grid gap-6">
          {animals.map((animal, index) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              vaccines={vaccinesOf(animal.id)}
              movements={movementsOf(animal.id)}
              reproEvents={reprosOf(animal.id)}
              reproState={reproStateOf(animal.id)}
              onEditAnimal={() => openModal("animal", { editingAnimal: animal })}
              onDeleteAnimal={() => deleteItem("animal", animal.id)}
              onAddVaccine={() => openModal("vaccine", { currentAnimalForVaccine: animal })}
              onEditVaccine={(vaccine) =>
                openModal("vaccine", { editingVaccine: vaccine, currentAnimalForVaccine: animal })
              }
              onDeleteVaccine={(vaccineId) => deleteItem("vaccine", vaccineId)}
              onAddMovement={() => openModal("movement", { currentAnimalForMovement: animal })}
              onEditMovement={(mv) =>
                openModal("movement", { editingMovement: mv, currentAnimalForMovement: animal })
              }
              onDeleteMovement={(mvId) => deleteItem("movement", mvId)}
              onAddRepro={() => openModal("repro", { currentAnimalForRepro: animal })}
              onEditRepro={(rp) =>
                openModal("repro", { editingRepro: rp, currentAnimalForRepro: animal })
              }
              onDeleteRepro={(rpId) => deleteItem("repro", rpId)}
              index={index}
            />
          ))}

          {animals.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Nenhum animal cadastrado.</p>
                <p className="text-sm text-gray-400 mt-2">Clique em "Novo Animal" para começar.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modais */}
      <AnimalDialog
        open={modalState.animal}
        onClose={() => closeModal("animal")}
        onSubmit={handleAnimalSubmit}
        initialData={modalState.editingAnimal}
        validateEarring={validateEarring}
      />

      <VaccineDialog
        open={modalState.vaccine}
        onClose={() => closeModal("vaccine")}
        onSubmit={handleVaccineSubmit}
        initialData={modalState.editingVaccine}
        animal={modalState.currentAnimalForVaccine}
      />

      <MovementDialog
        open={modalState.movement}
        onClose={() => closeModal("movement")}
        onSubmit={handleMovementSubmit}
        initialData={modalState.editingMovement}
        animal={modalState.currentAnimalForMovement}
      />

      <ReproDialog
        open={modalState.repro}
        onClose={() => closeModal("repro")}
        onSubmit={handleReproSubmit}
        initialData={modalState.editingRepro}
        animal={modalState.currentAnimalForRepro}
      />
    </>
  );
};

export default Animals;
