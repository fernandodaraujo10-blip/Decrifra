import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Eye,
  Heart,
  Landmark,
  Search,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { MovieAnalysis } from '../../types';
import { fetchDynamicImage, getCachedImage, setCachedImage } from '../core/image-search';

type SectionItem = {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  fullWidth?: boolean;
};

interface MusicResultScreenProps {
  result: MovieAnalysis;
  title: string;
  onNewSearch: () => void;
  bannerImage: string;
  artistImage: string;
  mediaType?: 'movie' | 'book' | 'music';
}

const makeSnippet = (text?: string, fallback = 'Conteúdo indisponível no momento.') => {
  const normalized = (text || '').trim();
  if (!normalized) return fallback;
  return normalized.length > 230 ? `${normalized.slice(0, 227)}...` : normalized;
};

const DecifraResultScreen: React.FC<MusicResultScreenProps> = ({ result, title, onNewSearch, bannerImage, artistImage, mediaType }) => {
  const [topSectionId, setTopSectionId] = useState<string>('resumo');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('essencia');
  const [isSectionOpen, setIsSectionOpen] = useState<boolean>(false);
  const [selectedThinkerIndex, setSelectedThinkerIndex] = useState<number | null>(null);
  
  const [dynamicImage, setDynamicImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setImageLoading(true);

    const loadDynamicImage = async () => {
      try {
        // Detect mediaType if not passed explicitly, or use passed type
        const typeStr = result.info?.genre?.toLowerCase() || '';
        let detectedType = mediaType;
        if (!detectedType) {
          if (typeStr.includes('music') || typeStr.includes('rock') || typeStr.includes('pop')) detectedType = 'music';
          else if (result.info?.director || typeStr.includes('drama') || typeStr.includes('sci-fi')) detectedType = 'movie';
          else detectedType = 'book';
        }
        
        const cached = getCachedImage(title, detectedType!);
        if (cached) {
          if (isMounted) {
            setDynamicImage(cached);
            setImageLoading(false);
          }
          return;
        }

        const url = await fetchDynamicImage(title, detectedType!);
        if (url && isMounted) {
          setDynamicImage(url);
          setCachedImage(title, detectedType!, url);
        }
      } catch (err) {
        console.warn('Failed to load dynamic image', err);
      } finally {
        if (isMounted) setImageLoading(false);
      }
    };

    loadDynamicImage();

    return () => { isMounted = false; };
  }, [title, mediaType, result]);

  const compactGenre = useMemo(() => {
    const raw = (result.info?.genre || 'Rock/Pop').trim();
    const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    return parts[0] || 'Rock/Pop';
  }, [result.info?.genre]);

  const overallRating = useMemo(() => {
    if (!result.ratings?.length) return '9.8';
    return (result.ratings.reduce((acc, curr) => acc + Number(curr.score || 0), 0) / result.ratings.length).toFixed(1);
  }, [result]);

  const topContent = useMemo(() => {
    switch (topSectionId) {
      case 'resumo':
        return {
          label: 'Resumo da Obra',
          text: result.exegesis?.centralThesis || result.whyWatch || "Análise em processamento para extração dos pontos centrais da obra."
        };
      case 'essencia':
        return {
          label: 'A Essência',
          text: result.exegesis?.centralThesis || result.whyWatch || "Significado central e tese da obra."
        };
      case 'notas':
        return {
          label: `Notas (${overallRating})`,
          text: result.ratings?.map(r => `${r.criterion}: ${r.score}`).join(' | ') || "Avaliação detalhada dos critérios técnicos e artísticos."
        };
      case 'leitura':
        return {
          label: 'Leitura Crítica',
          text: result.info?.synopsis || "Análise da estrutura, recursos e narrativa da obra."
        };
      default:
        return { label: 'Resumo', text: '' };
    }
  }, [topSectionId, result, overallRating]);

  const sections = useMemo<SectionItem[]>(() => {
    const ratingExplain = result.ratings?.slice(0, 2).map((r) => `${r.criterion}: ${r.explanation}`).join(' ') || '';
    const symbols = result.symbols?.slice(0, 2).map((s) => `${s.name}: ${s.representation}`).join(' ') || '';
    const conflicts = result.characterConflicts?.slice(0, 2).map((c) => `${c.name}: ${c.internalContradiction}`).join(' ') || '';
    const lessons = result.lessons?.existential?.slice(0, 2).join(' ') || '';
    const perspectives = result.perspectives?.slice(0, 2).map((p) => `${p.name}`).join(', ') || '';

    return [
      { id: 'essencia', title: 'A Essência', subtitle: 'Significado central.', detail: makeSnippet(result.exegesis?.centralThesis || result.whyWatch), icon: Sparkles },
      { id: 'valoracao', title: 'Valoração', subtitle: 'Valores da obra.', detail: makeSnippet(ratingExplain), icon: Star },
      { id: 'energia', title: 'Energia', subtitle: 'Carga emocional.', detail: makeSnippet(result.deepEssay), icon: Zap },
      { id: 'analise', title: 'Análise', subtitle: 'Estrutura e recursos.', detail: makeSnippet(result.info?.synopsis), icon: Search },
      { id: 'arquetipos', title: 'Arquétipos e Personagens', subtitle: 'Papéis e símbolos.', detail: makeSnippet(result.characters?.slice(0, 2).map((c) => `${c.name}: ${c.description}`).join(' ')), icon: Users },
      { id: 'simbologia', title: 'Simbologia e Mensagens Ocultas', subtitle: 'Significados profundos.', detail: makeSnippet(symbols), icon: Eye },
      { id: 'conflitos', title: 'Conflitos e Dilemas', subtitle: 'Tensões e contrapontos.', detail: makeSnippet(conflicts), icon: Heart },
      { id: 'licoes', title: 'Lições e Reflexões', subtitle: 'Aprendizados centrais.', detail: makeSnippet(lessons), icon: BookOpen },
      { id: 'leituras', title: 'Leituras Alternativas', subtitle: 'Outras perspectivas.', detail: makeSnippet([result.alternativeReadings?.psychological, result.alternativeReadings?.philosophical, result.alternativeReadings?.spiritual].filter(Boolean).join(' ')), icon: Target },
      { id: 'sintese', title: 'Síntese', subtitle: 'Conexões principais.', detail: makeSnippet(`${result.synthesis?.centralThesis || ''} ${result.synthesis?.conclusion || ''}`), icon: BookOpen },
      { id: 'visoes', title: 'Visões', subtitle: 'Percepções de 10 pensadores.', detail: makeSnippet(perspectives), icon: Landmark, fullWidth: true },
    ];
  }, [result]);

  const selected = useMemo(() => sections.find((s) => s.id === selectedSectionId) ?? sections[0], [sections, selectedSectionId]);
  const SelectedIcon = selected?.icon || Sparkles;

  const detailBlocks = useMemo(() => {
    const parts = selected.detail.split(/[.!?]\s+/).map((x) => x.trim()).filter(Boolean);
    const list = (parts.length ? parts : [selected.detail]).slice(0, 3);
    return list.map((text, idx) => ({
      id: `${selected.id}-${idx}`,
      title: idx === 0 ? 'Ponto principal' : idx === 1 ? 'Leitura complementar' : 'Insight final',
      text: text.endsWith('.') ? text : `${text}.`,
    }));
  }, [selected]);

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full flex flex-col gap-3">
        <div className="flex-none space-y-3">
          {/* Topo com Título e Nova Busca */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <h2 className="serif text-[2.1rem] leading-none text-[#1F1A17]">{title}</h2>
            <button
              type="button"
              onClick={onNewSearch}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#E4D4C1] bg-[#FFFDF8] px-3 text-[0.8rem] font-semibold text-[#3A2D1F] shadow-sm"
            >
              <Search size={14} strokeWidth={1.9} />
              Nova busca
            </button>
          </div>

          {/* Nova Seção Dinâmica: Card + Foto (Alturas reduzidas para liberar espaço) */}
          <section className="flex gap-2">
            <div className="flex-[0.85] rounded-[1.25rem] border border-[#E4D4C1] bg-[#FFFDF8] p-2.5 shadow-sm flex flex-col justify-center min-h-[130px]">
              <p className="text-[0.62rem] font-bold uppercase tracking-wider text-[#9E650F] mb-0.5">{topContent.label}</p>
              <p className="text-[0.76rem] leading-relaxed text-[#3A2D1F] line-clamp-5">
                {topContent.text}
              </p>
            </div>
            
            <div className="flex-1 min-w-[115px] h-[130px] rounded-[1.25rem] overflow-hidden border border-[#E4D4C1] shadow-md relative bg-[#E9DFD2]">
              {imageLoading && (
                <div className="absolute inset-0 bg-[#E9DFD2] animate-pulse flex items-center justify-center">
                  <Sparkles size={24} className="text-[#C1B09F] opacity-50" />
                </div>
              )}
              <img 
                src={dynamicImage || artistImage} 
                alt="Poster" 
                className={`h-full w-full object-cover transition-opacity duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`} 
                onLoad={() => setImageLoading(false)}
              />
            </div>
          </section>

          <section className="grid grid-cols-4 rounded-[1.05rem] border border-[#E4D4C1] bg-[#FFFDF8] px-1 py-0.5 shadow-sm">
            {[
              { id: 'resumo', label: 'RESUMO DA OBRA', icon: Sparkles },
              { id: 'essencia', label: 'ESSÊNCIA', icon: Landmark },
              { id: 'notas', label: `NOTAS (${overallRating})`, icon: Star },
              { id: 'leitura', label: 'LEITURA CRÍTICA', icon: BookOpen },
            ].map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = topSectionId === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setTopSectionId(tab.id)}
                  className={`px-0.5 py-1 text-center transition-all ${idx < 3 ? 'border-r border-[#E7DACA]' : ''}`}
                >
                  <div className={`mb-0.5 flex flex-col items-center justify-center gap-0.5 text-[0.58rem] font-bold tracking-tight ${isActive ? 'text-[#2A2018]' : 'text-[#8A7763]'}`}>
                    <Icon size={11} className={isActive ? 'text-[#C8871A]' : 'text-[#A56C1A]'} />
                    <span className="leading-tight">{tab.label}</span>
                  </div>
                  {isActive ? <div className="mx-auto h-[2px] w-12 rounded-full bg-[#C8871A]" /> : <div className="h-[2px]" />}
                </button>
              );
            })}
          </section>

          <section className="grid grid-cols-2 gap-2">
            <div className="rounded-[1.15rem] border border-[#E4D4C1] bg-[#FFFDF8] px-2.5 py-1.5 shadow-sm flex flex-col justify-center">
              <div className="space-y-0.5 text-[0.78rem] text-[#2C251F] leading-tight">
                <p className="truncate"><strong>Gênero:</strong> {compactGenre}</p>
                <p><strong>Ano:</strong> {result.info?.year || 'N/A'}</p>
                <p className="truncate"><strong>Autor/Dir:</strong> {result.info?.director || result.info?.author || 'N/A'}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedSectionId('visoes');
                setIsSectionOpen(true);
                setSelectedThinkerIndex(null);
              }}
              className="rounded-[1.15rem] border border-[#E4D4C1] bg-[#FFFDF8] px-2.5 py-1.5 shadow-sm text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8DCCB] bg-white text-[#2A2018]">
                  <Landmark size={18} strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-[1rem] text-[#2C241D] leading-none">Visões</p>
                  <p className="text-[0.6rem] text-[#5C4E41] mt-1 line-clamp-1 leading-tight">
                    {result.perspectives?.length || 0} pensadores
                  </p>
                </div>
              </div>
            </button>
          </section>

          <div className="h-px w-full bg-[#D8C9B8] mt-2" />
        </div>

        <section className="flex-1 min-h-0 rounded-[1.15rem] border border-[#DCCBB7] bg-[#EEE7DC] p-2 overflow-hidden mt-1">
          {!isSectionOpen ? (
            <div className="h-full grid grid-cols-2 gap-1.5 content-start">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = selectedSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setIsSectionOpen(true);
                      setSelectedThinkerIndex(null);
                    }}
                    className={`h-[58px] rounded-[0.95rem] border bg-[#FFFDF8] p-1.5 text-left transition-colors ${section.fullWidth ? 'col-span-2' : ''} ${isActive ? 'border-[#C8871A] ring-1 ring-[#C8871A]/35' : 'border-[#E4D4C1]'}`}
                  >
                    <div className="flex items-start gap-1.5">
                      <span className="inline-flex h-7.5 w-7.5 flex-shrink-0 items-center justify-center rounded-full border border-[#E8DCCB] bg-white text-[#B87716]">
                        <Icon size={14} strokeWidth={1.8} />
                      </span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="serif text-[0.8rem] leading-tight text-[#1F1A17]">{section.title}</h4>
                          <ChevronDown size={13} className="mt-0.5 flex-shrink-0 text-[#6F6258]" />
                        </div>
                        <p className="mt-0.5 text-[0.52rem] leading-snug text-[#332A22]">{section.subtitle}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            ) : selectedSectionId === 'visoes' ? (
            <div className="h-full min-h-0 rounded-[0.95rem] border border-[#DCCBB7] bg-[#FFFDF8] p-2 flex flex-col">
              {selectedThinkerIndex === null ? (
                <>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setIsSectionOpen(false)}
                      className="inline-flex h-7 items-center gap-1 rounded-full border border-[#E5D6C5] bg-[#FFF8EC] px-2 text-[0.62rem] font-semibold text-[#5E4A35]"
                    >
                      <ArrowLeft size={12} />
                      Voltar
                    </button>
                    <div className="flex items-center gap-1.5 text-[#9E650F]">
                      <Landmark size={11} strokeWidth={1.9} />
                      <span className="text-[0.58rem] font-bold uppercase tracking-[0.08em]">10 Visões Exegéticas</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-0.5 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3">
                      {result.perspectives?.map((p, idx) => {
                        // ... existing portraitMap and axisMap logic remains same inside the map
                        const portraitMap: Record<string, string> = {
                          'Paulo': '/portraits/paulo.png',
                          'Paulo de Tarso': '/portraits/paulo.png',
                          'Salomão': '/portraits/salomao.png',
                          'Dostoiévski': '/portraits/dostoievski.png',
                          'Freud': '/portraits/freud.png',
                          'Maquiavel': '/portraits/maquiavel.png',
                          'Sócrates': '/portraits/socrates.png',
                          'Jung': '/portraits/jung.png',
                          'Nietzsche': '/portraits/nietzsche.png',
                          'Sartre': '/portraits/sartre.png',
                          'Frankl': '/portraits/frankl.png',
                        };
                        const portraitUrl = portraitMap[p.name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=F5E6D3&color=8A6E4B&bold=true&font-size=0.33`;
                        const axisMap: Record<string, string> = {
                          'Paulo': 'Caridade Universal e Transformação.',
                          'Paulo de Tarso': 'Caridade Universal e Transformação.',
                          'Salomão': 'Sabedoria, Justiça e Prosperidade.',
                          'Dostoiévski': 'Liberdade, Sofrimento e Redenção.',
                          'Freud': 'Sublimação, Ilusão e Inconsciente.',
                          'Maquiavel': 'Realismo Político, Poder e Estratégia.',
                          'Sócrates': 'Conhecimento, Autoconhecimento e Virtude.',
                          'Jung': 'Arquétipos, Inconsciência Coletiva e Individuação.',
                          'Nietzsche': 'Vontade de Potência, Transvaloração e Superação.',
                          'Sartre': 'Existencialismo, Liberdade e Responsabilidade.',
                          'Frankl': 'Busca por Sentido, Resiliência e Realização Pessoal.',
                        };
                        const axisText = axisMap[p.name] || p.subtitle || 'Visão Exegética';
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedThinkerIndex(idx)}
                            className="flex items-center gap-3 rounded-[1.25rem] border border-[#EADBC8] bg-white p-2.5 text-left shadow-sm transition-all active:scale-[0.97] hover:bg-[#FFFBF5] h-[72px]"
                          >
                            <div className="h-12 w-12 flex-none rounded-xl bg-[#F5E6D3] overflow-hidden shadow-sm">
                              <img src={portraitUrl} alt={p.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="serif font-bold text-[0.9rem] text-[#1F1A17] truncate leading-tight">{p.name}</h5>
                                <ChevronDown size={14} className="-rotate-90 text-[#C1B09F] flex-none" />
                              </div>
                              <p className="text-[0.62rem] text-[#6F6258] leading-snug line-clamp-2 mt-1 italic">{axisText}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Cabeçalho Horizontal Otimizado */}
                  <div className="flex items-center justify-between gap-2 pt-0 pb-2">
                    {/* Retrato à Esquerda */}
                    <div className="h-12 w-12 rounded-xl bg-white p-0.5 shadow-md ring-1 ring-[#EADBC8] flex-none">
                       <div className="h-full w-full rounded-lg overflow-hidden bg-[#F5E6D3]">
                        <img 
                              src={(() => {
                                const portraitMap: Record<string, string> = {
                                  'Paulo': '/portraits/paulo.png',
                                  'Paulo de Tarso': '/portraits/paulo.png',
                                  'Salomão': '/portraits/salomao.png',
                                  'Dostoiévski': '/portraits/dostoievski.png',
                                  'Freud': '/portraits/freud.png',
                                  'Maquiavel': '/portraits/maquiavel.png',
                                  'Sócrates': '/portraits/socrates.png',
                                  'Jung': '/portraits/jung.png',
                                  'Nietzsche': '/portraits/nietzsche.png',
                                  'Sartre': '/portraits/sartre.png',
                                  'Frankl': '/portraits/frankl.png',
                                };
                                const thinker = result.perspectives?.[selectedThinkerIndex];
                                if (!thinker) return `https://ui-avatars.com/api/?background=F5E6D3&color=8A6E4B&bold=true`;
                                return portraitMap[thinker.name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(thinker.name)}&background=F5E6D3&color=8A6E4B&bold=true&font-size=0.33`;
                              })()} 
                              alt="Pensador" 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const thinker = result.perspectives?.[selectedThinkerIndex];
                                const name = thinker?.name || 'Pensador';
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F5E6D3&color=8A6E4B&bold=true&font-size=0.33`;
                              }}
                          />
                       </div>
                    </div>

                    {/* Nome e Descrição Centralizados */}
                    <div className="text-center flex-1 px-2 min-w-0">
                      <h4 className="serif text-[1.15rem] leading-none text-[#1F1A17] tracking-tight mb-0.5 truncate">
                        {result.perspectives?.[selectedThinkerIndex]?.name || 'Pensador'}
                      </h4>
                      <p className="text-[0.52rem] font-bold text-[#9E650F] uppercase tracking-[0.08em] line-clamp-1">
                        {result.perspectives?.[selectedThinkerIndex]?.subtitle || 'Visão Exegética'}
                      </p>
                    </div>

                    {/* Botão Voltar à Direita */}
                    <button
                      onClick={() => setSelectedThinkerIndex(null)}
                      className="flex-none inline-flex h-7 items-center gap-1 rounded-full border border-[#E5D6C5] bg-[#FFF8EC] px-2 text-[0.62rem] font-semibold text-[#5E4A35]"
                    >
                      <ArrowLeft size={12} />
                      Voltar
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto rounded-[1.4rem] border border-[#EADBC8] bg-white p-3 shadow-inner space-y-6 custom-scrollbar">
                    {/* Seções de Análise no Topo para Acesso Rápido */}
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[#9E650F]">
                          <div className="h-5 w-5 rounded-full bg-[#9E650F]/10 flex items-center justify-center">
                            <BookOpen size={12} strokeWidth={2.5} />
                          </div>
                          <h6 className="text-[0.68rem] font-black uppercase tracking-widest">Interpretação</h6>
                        </div>
                        <p className="text-[0.85rem] leading-[1.65] text-[#4A3F35] pl-7 border-l border-[#9E650F]/15 text-justify">
                          {result.perspectives?.[selectedThinkerIndex]?.interpretation || result.perspectives?.[selectedThinkerIndex]?.commentary || 'Análise em processamento.'}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[#9E650F]">
                          <div className="h-5 w-5 rounded-full bg-[#9E650F]/10 flex items-center justify-center">
                            <Star size={12} strokeWidth={2.5} />
                          </div>
                          <h6 className="text-[0.68rem] font-black uppercase tracking-widest">Significado</h6>
                        </div>
                        <p className="text-[0.85rem] leading-[1.65] text-[#4A3F35] pl-7 border-l border-[#9E650F]/15 text-justify">
                          {result.perspectives?.[selectedThinkerIndex]?.meaning || 'O impacto simbólico está sendo processado para esta obra.'}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[#9E650F]">
                          <div className="h-5 w-5 rounded-full bg-[#9E650F]/10 flex items-center justify-center">
                            <Zap size={12} strokeWidth={2.5} />
                          </div>
                          <h6 className="text-[0.68rem] font-black uppercase tracking-widest">Aplicação</h6>
                        </div>
                        <p className="text-[0.85rem] leading-[1.65] text-[#4A3F35] pl-7 border-l border-[#9E650F]/15 text-justify">
                          {result.perspectives?.[selectedThinkerIndex]?.application || 'A aplicação prática está sendo delineada para sua reflexão.'}
                        </p>
                      </div>
                    </div>

                    {/* Texto Introdutório/Ensaio */}
                    <div className="relative pt-2 border-t border-[#EADBC8]/30">
                      <span className="float-left text-[3.5rem] leading-[0.7] font-serif text-[#9E650F] mr-3 mt-1 select-none opacity-80">
                        {(result.perspectives?.[selectedThinkerIndex]?.intro || ' ').charAt(0)}
                      </span>
                      <p className="text-[0.88rem] leading-[1.5] text-[#3A2D1F] font-medium text-justify">
                        {(result.perspectives?.[selectedThinkerIndex]?.intro || ' ').slice(1)}
                      </p>
                    </div>

                    <div className="rounded-[1.2rem] bg-gradient-to-br from-[#FDF8F1] to-[#F8F1E5] p-3 border border-[#EADBC8] shadow-sm relative overflow-hidden group">
                      <div className="absolute -top-4 -right-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                         <Landmark size={80} />
                      </div>
                      <div className="relative z-10">
                        <p className="serif text-[1.05rem] leading-snug text-[#2C241D] text-center italic font-medium">
                          “{result.perspectives?.[selectedThinkerIndex]?.impactPhrase || result.perspectives?.[selectedThinkerIndex]?.quote || 'A sabedoria reside na busca constante pelo sentido.'}”
                        </p>
                        {result.perspectives?.[selectedThinkerIndex]?.source && (
                          <div className="mt-2 flex flex-col items-center">
                            <div className="h-px w-6 bg-[#9E650F]/30 mb-1" />
                            <p className="text-[0.62rem] font-bold text-[#9E650F] uppercase tracking-tighter">
                              {result.perspectives?.[selectedThinkerIndex]?.source}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-0 rounded-[0.95rem] border border-[#DCCBB7] bg-[#FFFDF8] p-2 flex flex-col">
              <div className="mb-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsSectionOpen(false)}
                  className="inline-flex h-7 items-center gap-1 rounded-full border border-[#E5D6C5] bg-[#FFF8EC] px-2 text-[0.62rem] font-semibold text-[#5E4A35]"
                >
                  <ArrowLeft size={12} />
                  Voltar
                </button>
                <div className="flex items-center gap-1.5 text-[#9E650F]">
                  <Sparkles size={11} strokeWidth={1.9} />
                  <span className="text-[0.58rem] font-bold uppercase tracking-[0.08em]">Resposta da seção</span>
                </div>
              </div>

              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E8DCCB] bg-white text-[#B87716]">
                  <SelectedIcon size={14} strokeWidth={1.8} />
                </span>
                <h4 className="serif text-[0.84rem] leading-tight text-[#1F1A17]">{selected.title}</h4>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
                {detailBlocks.map((topic) => (
                  <div key={topic.id} className="rounded-lg border border-[#EADBC8] bg-[#FFF9EF] px-2 py-1.5 shadow-[0_3px_8px_rgba(0,0,0,0.04)]">
                    <p className="text-[0.58rem] font-bold uppercase tracking-[0.06em] text-[#9E650F]">{topic.title}</p>
                    <p className="mt-0.5 text-[0.68rem] leading-relaxed text-[#403429]">{topic.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DecifraResultScreen;
