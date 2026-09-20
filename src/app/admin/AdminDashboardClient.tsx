"use client";

import { useState } from "react";
import { createGame, updateGame, deleteGame, updateGameStatus, logoutAdmin } from "@/app/actions";
import { Plus, Edit2, Trash2, Search, Star, LogOut, Disc, Tag, Globe, X, Image as ImageIcon, Info } from "lucide-react";
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
  tags?: string[];
  isJapanOnly?: boolean;
  summary?: string | null;
  storyline?: string | null;
  developer?: string | null;
  publisher?: string | null;
  releaseYear?: number | null;
  screenshots?: string[];
  videoUrl?: string | null;
}

interface AdminDashboardClientProps {
  initialGames: Game[];
}

const POPULAR_TAGS = [
  "Arcade",
  "Corrida",
  "Ação",
  "Aventura",
  "RPG",
  "Terror",
  "Luta",
  "Hack and Slash",
  "Tiro",
  "Plataforma",
  "Furtividade",
  "Mundo Aberto",
  "Sobrevivência",
  "Estratégia",
  "Esporte",
  "Simulador",
  "Anime",
  "Puzzle",
];

export default function AdminDashboardClient({ initialGames }: AdminDashboardClientProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState<"all" | "international" | "japan">("all");

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
  const [formTags, setFormTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [formIsJapanOnly, setFormIsJapanOnly] = useState(false);
  const [formSummary, setFormSummary] = useState("");
  const [formDeveloper, setFormDeveloper] = useState("");
  const [formPublisher, setFormPublisher] = useState("");
  const [formReleaseYear, setFormReleaseYear] = useState("");
  const [formScreenshotsText, setFormScreenshotsText] = useState("");
  const [formScreenshots, setFormScreenshots] = useState<string[]>([]);
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
    setFormTags([]);
    setCustomTagInput("");
    setFormIsJapanOnly(false);
    setFormSummary("");
    setFormDeveloper("");
    setFormPublisher("");
    setFormReleaseYear("");
    setFormScreenshotsText("");
    setFormScreenshots([]);
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
    setFormTags(game.tags || []);
    setFormIsJapanOnly(Boolean(game.isJapanOnly));
    setFormSummary(game.summary || "");
    setFormDeveloper(game.developer || "");
    setFormPublisher(game.publisher || "");
    setFormReleaseYear(game.releaseYear ? String(game.releaseYear) : "");
    setFormScreenshots(game.screenshots || []);
    setFormScreenshotsText((game.screenshots || []).join("\n"));
    setCustomTagInput("");
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
    if (Array.isArray(item.tags) && item.tags.length > 0) {
      setFormTags(item.tags);
    }
    if (typeof item.isJapanOnly === "boolean") {
      setFormIsJapanOnly(item.isJapanOnly);
    }
    if (item.summary) setFormSummary(item.summary);
    if (item.developer) setFormDeveloper(item.developer);
    if (item.publisher) setFormPublisher(item.publisher);
    if (item.releaseYear) setFormReleaseYear(String(item.releaseYear));
    if (Array.isArray(item.screenshots) && item.screenshots.length > 0) {
      setFormScreenshots(item.screenshots);
      setFormScreenshotsText(item.screenshots.join("\n"));
    }
    setApiResults([]);
  }

  function handleToggleTag(tag: string) {
    if (formTags.includes(tag)) {
      setFormTags(formTags.filter((t) => t !== tag));
    } else {
      setFormTags([...formTags, tag]);
    }
  }

  function handleAddCustomTag() {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!formTags.includes(trimmed)) {
      setFormTags([...formTags, trimmed]);
    }
    setCustomTagInput("");
  }

  async function handleSaveGame(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Processa screenshots da textarea
      const parsedScreenshots = formScreenshotsText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.startsWith("http"));

      const payload = {
        title: formTitle,
        coverUrl: formCoverUrl || undefined,
        status: formStatus,
        rating: formRating ? Number(formRating) : null,
        playedAt: formPlayedAt || null,
        notes: formNotes || null,
        igdbId: formIgdbId || null,
        tags: formTags,
        isJapanOnly: formIsJapanOnly,
        summary: formSummary || null,
        developer: formDeveloper || null,
        publisher: formPublisher || null,
        releaseYear: formReleaseYear ? Number(formReleaseYear) : null,
        screenshots: parsedScreenshots.length > 0 ? parsedScreenshots : formScreenshots,
      };

      if (editingGame) {
        await updateGame(editingGame.id, payload);
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

  const filteredGames = games.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.tags && g.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    if (!matchesSearch) return false;

    if (filterRegion === "japan") return g.isJapanOnly === true;
    if (filterRegion === "international") return !g.isJapanOnly;

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Barra superior de Ações do Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Painel de Gerenciamento PS2
          </h1>
          <p className="text-xs text-slate-400">
            Adicione novos jogos, consulte capas, gerencie tags, screenshots e exclusividades do Japão.
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
              Buscar Informações, Capa, Screenshots e Tags Automaticamente
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: God of War, Initial D, Silent Hill 2, Berserk, GTA San Andreas..."
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
                      <div className="flex items-center gap-1">
                        {item.isJapanOnly && <span className="text-[10px]">🇯🇵</span>}
                        <p className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-300">
                          {item.title}
                        </p>
                      </div>
                      <span className="text-[10px] text-cyan-400">Usar estes dados</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSaveGame} className="space-y-5">
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

            {/* Checkbox de Exclusividade do Japão */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇯🇵</span>
                <div>
                  <span className="text-xs font-bold text-rose-300 block">
                    Jogo Exclusivo do Japão (Japan Only / NTSC-J)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Marque caso este jogo tenha sido lançado apenas no mercado japonês.
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsJapanOnly}
                  onChange={(e) => setFormIsJapanOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Seletor de Tags */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Tags & Categorias (ex: Arcade, Corrida, RPG...)</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  {formTags.length} selecionada(s)
                </span>
              </div>

              {/* Tags Atualmente Selecionadas */}
              {formTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-2">
                  {formTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/50"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className="hover:text-red-400 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Sugestões Rápidas */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Clique para adicionar rapidamente:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {POPULAR_TAGS.map((tag) => {
                    const isSelected = formTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                          isSelected
                            ? "bg-cyan-500 text-black font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                            : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-cyan-300 border border-slate-800"
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campo para Adicionar Tag Customizada */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Digitar outra tag customizada..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Metadados Avançados: Desenvolvedora, Publicadora e Ano */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Desenvolvedora (Developer)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Capcom, Konami, Rockstar..."
                  value={formDeveloper}
                  onChange={(e) => setFormDeveloper(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Publicadora (Publisher)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sony, Capcom, EA..."
                  value={formPublisher}
                  onChange={(e) => setFormPublisher(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ano de Lançamento
                </label>
                <input
                  type="number"
                  placeholder="Ex: 2004"
                  value={formReleaseYear}
                  onChange={(e) => setFormReleaseYear(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Sinopse / Sobre o Jogo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sinopse / Sobre o Jogo
              </label>
              <textarea
                rows={3}
                placeholder="Descrição geral da história, enredo e gameplay do jogo..."
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Screenshots de Gameplay */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Screenshots de Gameplay (Uma URL por linha)
              </label>
              <textarea
                rows={3}
                placeholder="https://images.igdb.com/...&#10;https://..."
                value={formScreenshotsText}
                onChange={(e) => setFormScreenshotsText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
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
                  Nota Pessoal (0 a 10)
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
                Minhas Anotações & Memórias
              </label>
              <textarea
                rows={2}
                placeholder="Observações pessoais sobre sua gameplay, memórias nostálgicas..."
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por nome ou tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setFilterRegion("all")}
                className={`px-2.5 py-1 rounded font-medium ${
                  filterRegion === "all" ? "bg-cyan-500 text-black font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterRegion("international")}
                className={`px-2.5 py-1 rounded font-medium ${
                  filterRegion === "international"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🌐 Internacionais
              </button>
              <button
                onClick={() => setFilterRegion("japan")}
                className={`px-2.5 py-1 rounded font-medium ${
                  filterRegion === "japan"
                    ? "bg-rose-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                🇯🇵 Japão
              </button>
            </div>

            <span className="text-xs text-slate-400 whitespace-nowrap">
              Total: {filteredGames.length} jogos
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl ps2-glass border border-cyan-500/20">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Jogo</th>
                <th className="py-3 px-4">Região</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Nota</th>
                <th className="py-3 px-4">Concluído em</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredGames.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{game.title}</span>
                          {game.isJapanOnly && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 border border-rose-600/40 font-bold">
                              🇯🇵 JAP
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {game.tags && game.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {game.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300/80 border border-cyan-900/40 font-mono"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {game.isJapanOnly ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                          <span>🇯🇵</span>
                          <span>Japão Only</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <span>🌐</span>
                          <span>Internacional</span>
                        </span>
                      )}
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
