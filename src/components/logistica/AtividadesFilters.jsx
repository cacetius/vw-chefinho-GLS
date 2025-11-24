import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function AtividadesFilters({ onFilterChange }) {
  const [status, setStatus] = useState("all");
  const [prioridade, setPrioridade] = useState("all");

  const handleFilterChange = (type, value) => {
    if (type === "status") setStatus(value);
    if (type === "prioridade") setPrioridade(value);
    onFilterChange({ 
      status: type === "status" ? value : status, 
      prioridade: type === "prioridade" ? value : prioridade 
    });
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <Select value={status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <Select value={prioridade} onValueChange={(value) => handleFilterChange("prioridade", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Prioridades</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}