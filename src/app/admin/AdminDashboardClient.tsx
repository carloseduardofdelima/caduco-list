"use client";

import { useState } from "react";
import { createGame, updateGame, deleteGame, updateGameStatus, logoutAdmin } from "@/app/actions";
import { Plus, Edit2, Trash2, Search, Star, LogOut, Disc, Check, ExternalLink } from "lucide-react";
import { Status } from "@prisma/client";

interface Game {
  id: string;
  title: string;
  coverUrl?: string | null;
  status: Status;
  rating?: number | null;
  playedAt?: string | null;
  notes?: string | null;
  igdbId?: string | null;
}

interface AdminDashboardClientProps {
  initialGames: Game[];
}

export default function AdminDashboardClient({ initialGames }: AdminDashboardClientProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Busca de Capas externa
  const [apiSearchTerm, setApiSearchTerm] = useState("");
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiResults, setApiResults] = useState<any[]>([]);

  // Campos do formulário
  const [formTitle, setFormTitle] = useState("");
  const [formCoverUrl, setFormCoverUrl] = useState("");
  const [formStatus, setFormStatus] = useState<Status>("BACKLOG");
  const [formRating, setFormRating] = useState<string>("");
  const [formPlayedAt, setFormPlayedAt] = useState<string>("");
  const [formNotes, setFormNotes] = useState("");
  const [formIgdbId, setFormIgdbId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function resetForm() {
    setEditingGame(null);
    setFormTitle("");
    setFormCoverUrl("");
    setFormStatus("BACKLOG");
    setFormRating("");
    setFormPlayedAt("");
    setFormNotes("");
    setFormIgdbId("");
    setApiResults([]);
    setIsFormOpen(false);
  }

  function handleOpenCreate() {
    resetForm();
    setIsFormOpen(true);
  }

  function handleOpenEdit(game: Game) {
    setEditingGame(game);
    setFormTitle(game.title);
    setFormCoverUrl(game.coverUrl || "");
    setFormStatus(game.status);
    setFormRating(game.rating ? String(game.rating) : "");
    setFormPlayedAt(game.playedAt ? new Date(game.playedAt).toISOString().split("T")[0] : "");
    setFormNotes(game.notes || "");
    setFormIgdbId(game.igdbId || "");
    setIsFormOpen(true);
  }

  async function handleSearchApi() {
    if (!apiSearchTerm.trim()) return;
    setIsSearchingApi(true);
    try {
      const res = await fetch(`/api/games/search?q=${encodeURIComponent(apiSearchTerm)}`);
      const data = await res.json();
      setApiResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingApi(false);
    }
  }

  function handleSelectApiResult(item: any) {
    setFormTitle(item.title);
    if (item.coverUrl) setFormCoverUrl(item.coverUrl);
    if (item.id) setFormIgdbId(String(item.id));
    if (item.rating && !formRating) setFormRating(String(item.rating));
    setApiResults([]);
  }

  async function handleSaveGame(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        title: formTitle,
        coverUrl: formCoverUrl || undefined,
        status: formStatus,
        rating: formRating ? Number(formRating) : null,
        playedAt: formPlayedAt || null,
        notes: formNotes || null,
        igdbId: formIgdbId || null,
      };

      if (editingGame) {
        const updated = await updateGame(editingGame.id, payload);
        setGames((prev) =>
          prev.map((g) => (g.id === editingGame.id ? { ...g, ...payload, id: g.id } : g))
        );
      } else {
        const created = await createGame(payload);
        setGames((prev) => [
          {
            ...payload,
            id: created.id,
            playedAt: payload.playedAt,
          },
          ...prev,
        ]);
      }
      resetForm();
    } catch (err) {
      alert("Erro ao salvar jogo. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (confirm(`Tem certeza que deseja excluir "${title}"?`)) {
      try {
        await deleteGame(id);
        setGames((prev) => prev.filter((g) => g.id !== id));
      } catch {
        alert("Erro ao excluir jogo.");
      }
    }
  }

  async function handleQuickStatusChange(id: string, newStatus: Status) {
    try {
      await updateGameStatus(id, newStatus);
      setGames((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status: newStatus } : g))
      );
    } catch {
      alert("Erro ao atualizar status.");
    }
  }

  const filteredGames = games.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Barra superior de Ações do Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Painel de Gerenciamento PS2
          </h1>
          <p className="text-xs text-slate-400">
            Adicione novos jogos, consulte capas e gerencie avaliações e backlog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg ps2-glow-button text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Jogo</span>
          </button>
          <button
            onClick={() => logoutAdmin()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-900/40 text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Modal / Formulário de Cadastro e Edição */}
      {isFormOpen && (
        <div className="p-6 rounded-2xl ps2-glass border border-cyan-500/40 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-cyan-400">
              {editingGame ? `Editar: ${editingGame.title}` : "Cadastrar Novo Jogo"}
            </h2>
            <button
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          {/* Busca de Metadados / Capa na API */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-cyan-900/40 space-y-3">
            <label className="block text-xs font-semibold text-cyan-300">
              Buscar Informações e Capa Automaticamente
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: God of War, Silent Hill 2, Shadow of the Colossus..."
                value={apiSearchTerm}
                onChange={(e) => setApiSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchApi())}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleSearchApi}
                disabled={isSearchingApi}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isSearchingApi ? "Buscando..." : "Buscar"}</span>
              </button>
            </div>

            {/* Resultados da busca na API */}
            {apiResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {apiResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectApiResult(item)}
                    className="cursor-pointer p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-400 flex items-center gap-2 group transition-all"
                  >
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-10 h-12 object-cover rounded"
                      />
                    ) : (
                      <Disc className="w-8 h-8 text-slate-600" />
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-300">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-cyan-400">Usar estes dados</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSaveGame} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título do Jogo *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status *
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as Status)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="BACKLOG">Backlog (Planejado)</option>
                  <option value="PLAYING">Jogando Atualmente</option>
                  <option value="PLAYED">Jogado / Concluído</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL da Capa (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formCoverUrl}
                  onChange={(e) => setFormCoverUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nota (0 a 10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Ex: 9"
                  value={formRating}
                  onChange={(e) => setFormRating(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Data em que jogou
                </label>
                <input
                  type="date"
                  value={formPlayedAt}
                  onChange={(e) => setFormPlayedAt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anotações e Memórias
              </label>
              <textarea
                rows={3}
                placeholder="Observações pessoais sobre a gameplay, memórias nostálgicas..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-lg ps2-glow-button text-white text-xs font-bold disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : editingGame ? "Atualizar Jogo" : "Salvar Jogo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela / Lista de Jogos Gerenciáveis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar jogos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <span className="text-xs text-slate-400">Total: {filteredGames.length} jogos</span>
        </div>

        <div className="overflow-x-auto rounded-xl ps2-glass border border-cyan-500/20">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Jogo</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Nota</th>
                <th className="py-3 px-4">Concluído em</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredGames.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">
                    Nenhum jogo encontrado no catálogo.
                  </td>
                </tr>
              ) : (
                filteredGames.map((game) => (
                  <tr key={game.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      {game.coverUrl ? (
                        <img
                          src={game.coverUrl}
                          alt={game.title}
                          className="w-8 h-10 object-cover rounded"
                        />
                      ) : (
                        <Disc className="w-8 h-8 text-slate-600" />
                      )}
                      <div>
                        <span className="font-bold text-white block">{game.title}</span>
                        <span className="text-[10px] text-slate-500">PS2</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={game.status}
                          onChange={(e) =>
                            handleQuickStatusChange(game.id, e.target.value as Status)
                          }
                          className="bg-slate-900 border border-slate-700 text-[11px] rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="PLAYED">Jogado</option>
                          <option value="PLAYING">Jogando</option>
                          <option value="BACKLOG">Backlog</option>
                        </select>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {game.rating ? (
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{game.rating}/10</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {game.playedAt ? (
                        <span>
                          {new Date(game.playedAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(game)}
                        className="p-1.5 rounded bg-blue-950/60 border border-blue-800/60 text-cyan-300 hover:border-cyan-400"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(game.id, game.title)}
                        className="p-1.5 rounded bg-red-950/60 border border-red-800/60 text-red-300 hover:border-red-400"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
