/**
 * Hook central de filtro por célula/equipe.
 *
 * Regras:
 *  - supervisor ou admin  → vê tudo
 *  - lider / monitor      → vê APENAS dados da própria equipe
 *  - registros sem equipe → visíveis somente para supervisor/admin
 */
export function useEquipeFilter(currentUser) {
  const isSupervisor =
    currentUser?.cargo === "supervisor" || currentUser?.role === "admin";

  const mesmaEquipe = (valor) =>
    currentUser?.equipe && valor === currentUser.equipe;

  /**
   * Filtra qualquer array pelo campo "equipe" (default) ou campo personalizado.
   * @param {Array} arr - Array de registros
   * @param {string} campo - Campo com o valor de equipe (default: "equipe")
   */
  const filtrar = (arr, campo = "equipe") => {
    if (isSupervisor) return arr;
    if (!currentUser?.equipe) return [];
    return arr.filter((x) => x[campo] === currentUser.equipe);
  };

  return { isSupervisor, filtrar, mesmaEquipe, equipe: currentUser?.equipe };
}