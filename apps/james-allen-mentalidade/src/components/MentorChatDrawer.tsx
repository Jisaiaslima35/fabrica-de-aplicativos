import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sendMentorQuestion } from '../services/api';
import type { ChatMessage } from '../types';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const MentorChatDrawer: React.FC = () => {
  const {
    isChatOpen,
    closeMentorChat,
    activeChatDay,
    activeChatTitle,
    navigateTo,
  } = useApp();

  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        sender: 'mentor',
        text: `Olá! Sou o seu mentor para a jornada dos 21 dias baseada nos ensinamentos de James Allen. Como posso ajudar você a refletir ou aplicar os princípios de **${activeChatTitle}** (Dia ${activeChatDay}) na sua vida hoje?`,
        day: activeChatDay,
        dayTitle: activeChatTitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen, isLoading]);

  const quickPrompts = [
    { label: 'Como aplicar hoje?', text: `Como posso aplicar a mensagem do Dia ${activeChatDay} (${activeChatTitle}) no meu dia a dia?` },
    { label: 'O homem é o que pensa?', text: 'Por que James Allen afirma que o homem é literalmente aquilo que pensa?' },
    { label: 'Superar ansiedade', text: 'Como controlar pensamentos ansiosos segundo os princípios do livro?' },
    { label: 'Jardim da mente', text: 'Qual é o segredo para arrancar ervas daninhas mentais?' },
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || inputQuestion).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      day: activeChatDay,
      dayTitle: activeChatTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await sendMentorQuestion({
        question: textToSend,
        day: activeChatDay,
        dayTitle: activeChatTitle,
      });

      const mentorMsg: ChatMessage = {
        id: 'mentor-' + Date.now(),
        sender: 'mentor',
        text: response.answer,
        day: response.day || activeChatDay,
        pages: response.pages,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, mentorMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        sender: 'mentor',
        text: 'Não foi possível conectar ao servidor no momento. Lembre-se: cultivar a mente exige paciência. Tente perguntar novamente em instantes.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'mentor',
        text: `Histórico limpo. Estou pronto para refletir com você sobre o **Dia ${activeChatDay} — ${activeChatTitle}**. O que gostaria de explorar?`,
        day: activeChatDay,
        dayTitle: activeChatTitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isChatOpen) return null;

  return (
    <div
      id="mentor-chat-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div
        id="mentor-chat-panel"
        className="w-full max-w-lg h-full bg-slate-50 dark:bg-[#0f1419] sepia:bg-[#f0e8dc] border-l border-slate-200 dark:border-[#1e2836] sepia:border-[#ded3c2] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1e2836] flex items-center justify-between bg-white dark:bg-[#161f2c]/80 sepia:bg-[#ece4d5]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1e3a5f] dark:bg-[#b8893e] text-white dark:text-[#0f1419] flex items-center justify-center font-serif font-bold text-sm shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#1e3a5f] dark:text-[#f7f4ed] text-base leading-tight flex items-center gap-1.5">
                <span>Professor Mentor</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-[#b8893e]/20 text-[#b8893e] dark:text-[#e0ad5b]">
                  Dia {activeChatDay}
                </span>
              </h3>
              <p className="text-[12px] text-stone-600 dark:text-stone-400 truncate max-w-[240px]">
                {activeChatTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              className="p-2 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-stone-800 transition-colors"
              title="Limpar conversa"
              aria-label="Limpar histórico"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeMentorChat}
              className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-slate-200/50 dark:hover:bg-stone-800 transition-colors"
              aria-label="Fechar painel do mentor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#1e3a5f]/10 dark:bg-[#b8893e]/20 text-[#1e3a5f] dark:text-[#d4a574] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#1e3a5f] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white dark:bg-[#1a2332] sepia:bg-[#eadecc] text-stone-800 dark:text-stone-200 border border-slate-200 dark:border-[#223044] rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text.split('\n\n').map((para, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-2.5' : ''}>
                        {para}
                      </p>
                    ))}
                  </div>

                  <div
                    className={`mt-1.5 text-[10px] text-right ${
                      isUser ? 'text-white/70' : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#1e3a5f]/10 dark:bg-[#b8893e]/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#b8893e] animate-spin" />
              </div>
              <div className="bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-[#223044] rounded-2xl rounded-tl-xs px-4 py-3 space-y-2 w-3/4">
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-5/6"></div>
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-4/6"></div>
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-3/6"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-[#1e2836]/70 bg-slate-100/60 dark:bg-[#141b24]/40 sepia:bg-[#f3ede1]/40">
          <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#b8893e]" />
            Sugestões de reflexão:
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.text)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs bg-white dark:bg-[#1a2332] border border-slate-200 dark:border-[#2a3a50] text-stone-700 dark:text-stone-300 hover:border-[#b8893e] hover:text-[#b8893e] dark:hover:text-[#e0ad5b] transition-all disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-[#1e2836] bg-white dark:bg-[#121924] sepia:bg-[#f3ede1]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="mentor-chat-input"
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={`Pergunte algo sobre o Dia ${activeChatDay}...`}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-[#1a2332] sepia:bg-[#f0e8dc] border border-slate-200 dark:border-[#2a3a50] text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] dark:focus:ring-[#b8893e]"
            />
            <button
              id="mentor-chat-send-btn"
              type="submit"
              disabled={!inputQuestion.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#1e3a5f] dark:bg-[#b8893e] text-white dark:text-[#0f1419] disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all shadow-xs"
              aria-label="Enviar pergunta ao mentor"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
