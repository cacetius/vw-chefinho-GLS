import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function AvisosFilters({ onFilterChange }) {
  const [prioridade, setPrioridade] = useState("all");
  const [categoria, setCategoria] = useState("all");

  const handleFilterChange = (type, value) => {
    if (type === "prioridade") setPrioridade(value);
    if (type === "categoria") setCategoria(value);
    onFilterChange({ 
      prioridade: type === "prioridade" ? value : prioridade, 
      categoria: type === "categoria" ? value : categoria 
    });
  };

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <Select value={prioridade} onValueChange={(value) => handleFilterChange("prioridade", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Prioridades</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="importante">Importante</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <Select value={categoria} onValueChange={(value) => handleFilterChange("categoria", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            <SelectItem value="geral">Geral</SelectItem>
            <SelectItem value="seguranca">Segurança</SelectItem>
            <SelectItem value="logistica">Logística</SelectItem>
            <SelectItem value="epi">EPI</SelectItem>
            <SelectItem value="treinamento">Treinamento</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}