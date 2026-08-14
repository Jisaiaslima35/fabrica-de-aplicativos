import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../db';
import { DAYS_CONTENT } from '../data/daysContent';
import type { ReflectionEntry } from '../types';
import {
  BookMarked,
  Search,
  Plus,
  Trash2,
  Edit3,
  Download,
  Share2,
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpen,
  Check,
  X,
} from 'lucide-react';

export const ReflectionsPage: React.FC = () => {
  const { navigateTo } = useApp();
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDay, setNewDay] = useState(1);
  const [newText, setNewText] = useState('');

  const loadReflections = async () => {
    const list = await db.reflections.toArray();
    // Sort chronologically descending (newest first)
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setReflections(list);
  };

  useEffect(() => {
    loadReflections();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta reflexão?')) {
      await db.reflections.delete(id);
      loadReflections();
    }
  };

  const handleStartEdit = (entry: ReflectionEntry) => {
    setEditingId(entry.id);
    setEditText(entry.text);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;
    await db.reflections.update(id, {
      text: editText.trim(),
      updatedAt: new Date().toISOString(),
    });
    setEditingId(null);
    loadReflections();
  };

  const handleCreateNew = async () => {
    if (!newText.trim()) return;
    const entry: ReflectionEntry = {
      id: `ref-${newDay}-${Date.now()}`,
      day: newDay,
      text: newText.trim(),
      createdAt: new Date().toISOString(),
    };
    await db.reflections.put(entry);
    setNewText('');
    setIsAddingNew(false);
    loadReflections();
  };

  const handleExportText = () => {
    if (reflections.length === 0) return;

    let output = '# Diário de Reflexões — James Allen: Mentalidade\n\n';
    output += `Exportado em: ${new Date().toLocaleDateString('pt-BR')}\n\n---\n\n`;

    reflections.forEach((r) => {
      const dayData = DAYS_CONTENT.find((d) => d.day === r.day);
      output += `### Dia ${r.day}: ${dayData?.title || ''}\n`;
      output += `*Data: ${new Date(r.createdAt).toLocaleString('pt-BR')}*\n\n`;
      output += `${r.text}\n\n---\n\n`;
    });

    const blob = new Blob([output], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diario-james-allen-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered list
  const filteredReflections = reflections.filter((entry) => {
    const matchesSearch =
      entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      DAYS_CONTENT.find((d) => d.day === entry.day)
        ?.title.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesDay =
      selectedDayFilter === 'all' ? true : entry.day === selectedDayFilter;

    return matchesSearch && matchesDay;
  });

  return (
    <div id="reflections-journal-view" className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1e3a5f] to-[#122338] text-white border border-[#b8893e]/30 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#b8893e]/20 text-[#d4a574] mb-2">
              <BookMarked className="w-3.5 h-3.5" />
              Diário Pessoal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Espelho das Reflexões
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              Seus pensamentos, insights e compromissos registrados ao longo dos 21 dias.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#b8893e] hover:bg-[#a67b37] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Reflexão</span>
            </button>

            {reflections.length > 0 && (
              <button
                onClick={handleExportText}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold backdrop-blur-xs transition-colors"
                title="Exportar anotações em Markdown"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* New Reflection Modal / Form */}
      {isAddingNew && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border-2 border-[#b8893e] shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#1e3a5f] dark:text-[#f7f4ed]">
              Escrever Nova Reflexão
            </h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              Vincular ao Dia:
            </label>
            <select
              value={newDay}
              onChange={(e) => setNewDay(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-[#101620] sepia:bg-[#e6dcce] border border-slate-200 dark:border-[#243346] text-stone-900 dark:text-stone-100 font-semibold"
            >
              {DAYS_CONTENT.map((d) => (
                <option key={d.day} value={d.day}>
                  Dia {d.day}: {d.title}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={4}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Como os ensinamentos deste dia impactam sua vida hoje?..."
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#f3ede1] border border-slate-200 dark:border-[#243346] text-stone-900 dark:text-stone-100 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-slate-100 dark:hover:bg-stone-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateNew}
              disabled={!newText.trim()}
              className="px-5 py-2 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#152a45]"
            >
              Salvar Entrada
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por palavra-chave nas suas anotações..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
        </div>

        {/* Day Filter */}
        <select
          value={selectedDayFilter}
          onChange={(e) =>
            setSelectedDayFilter(
              e.target.value === 'all' ? 'all' : Number(e.target.value)
            )
          }
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-none"
        >
          <option value="all">Todos os Dias ({reflections.length})</option>
          {DAYS_CONTENT.map((d) => (
            <option key={d.day} value={d.day}>
              Dia {d.day} ({reflections.filter((r) => r.day === d.day).length})
            </option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {filteredReflections.length === 0 && (
        <div
          id="reflections-empty-state"
          className="p-12 text-center rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-[#b8893e] flex items-center justify-center">
            <BookMarked className="w-8 h-8" />
          </div>

          <h3 className="font-serif text-2xl font-bold text-[#1e3a5f] dark:text-[#f7f4ed]">
            {searchQuery
              ? 'Nenhuma reflexão encontrada para sua busca'
              : 'Sua primeira reflexão aparecerá aqui'}
          </h3>

          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? 'Tente utilizar outras palavras ou limpar os filtros para ver todas as anotações.'
              : 'Ao concluir a leitura de qualquer dia, você pode registrar seus sentimentos e decisões no final do capítulo.'}
          </p>

          <button
            onClick={() => navigateTo('hoje')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#152a45] shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-[#e0ad5b]" />
            <span>Fazer a Leitura de Hoje</span>
          </button>
        </div>
      )}

      {/* Reflections List */}
      <div className="space-y-4">
        {filteredReflections.map((entry) => {
          const dayData = DAYS_CONTENT.find((d) => d.day === entry.day);
          const isEditing = editingId === entry.id;

          return (
            <div
              key={entry.id}
              className="p-6 rounded-3xl bg-white dark:bg-[#111722] sepia:bg-[#ede3d3] border border-slate-200 dark:border-[#1e2836] shadow-xs space-y-3 relative group"
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateTo('dia', entry.day)}
                  className="flex items-center gap-2 text-left group-hover:opacity-90"
                >
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/40 text-[#b8893e] border border-[#b8893e]/30">
                    Dia {entry.day}
                  </span>
                  <span className="font-serif font-bold text-sm text-[#1e3a5f] dark:text-[#f7f4ed]">
                    {dayData?.title}
                  </span>
                </button>

                <div className="flex items-center gap-1.5 text-stone-400">
                  <span className="text-[11px] font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(entry.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(entry.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <button
                    onClick={() => handleStartEdit(entry)}
                    className="p-1.5 hover:text-[#1e3a5f] dark:hover:text-[#d4a574] rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800"
                    title="Editar anotação"
                    aria-label="Editar reflexão"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                    title="Excluir anotação"
                    aria-label="Excluir reflexão"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Text content or Edit mode */}
              {isEditing ? (
                <div className="space-y-3 pt-2">
                  <textarea
                    rows={4}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#101620] sepia:bg-[#f3ede1] border border-slate-200 dark:border-[#243346] text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-slate-100"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveEdit(entry.id)}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#152a45]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-sans text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap pt-1">
                  {entry.text}
                </p>
              )}

              {/* Bottom Quote reminder */}
              {dayData && (
                <div className="pt-3 border-t border-slate-100 dark:border-stone-800/80 text-[11px] font-serif italic text-stone-500 dark:text-stone-400 flex items-center justify-between">
                  <span>“{dayData.keyQuote}”</span>
                  <button
                    onClick={() => navigateTo('dia', entry.day)}
                    className="not-italic font-sans font-bold text-[#1e3a5f] dark:text-[#d4a574] hover:underline flex items-center gap-0.5 ml-2"
                  >
                    <span>Rever Dia</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
