import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Eye,
  Grid3X3,
  Heart,
  Landmark,
  Music2,
  Search,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { MovieAnalysis } from '../../types';

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
}

const makeSnippet = (text?: string, fallback = 'Conteúdo indisponível no momento.') => {
  const normalized = (text || '').trim();
  if (!normalized) return fallback;
  return normalized.length > 230 ? `${normalized.slice(0, 227)}...` : normalized;
};

const MusicResultScreen: React.FC<MusicResultScreenProps> = ({ result, title, onNewSearch, bannerImage, artistImage }) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>('essencia');
  const [isSectionOpen, setIsSectionOpen] = useState<boolean>(false);

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

  const sections = useMemo<SectionItem[]>(() => {
    const ratingExplain = result.ratings?.slice(0, 2).map((r) => `${r.criterion}: ${r.explanation}`).join(' ') || '';
    const symbols = result.symbols?.slice(0, 2).map((s) => `${s.name}: ${s.representation}`).join(' ') || '';
    const conflicts = result.characterConflicts?.slice(0, 2).map((c) => `${c.name}: ${c.internalContradiction}`).join(' ') || '';
    const lessons = result.lessons?.existential?.slice(0, 2).join(' ') || '';
    const perspectives = result.perspectives?.slice(0, 2).map((p) => `${p.name}: ${p.commentary}`).join(' ') || '';

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
      { id: 'visoes', title: 'Visões', subtitle: 'Percepções pessoais.', detail: makeSnippet(perspectives), icon: Music2, fullWidth: true },
    ];
  }, [result]);

  const selected = useMemo(() => sections.find((s) => s.id === selectedSectionId) ?? sections[0], [sections, selectedSectionId]);
  const SelectedIcon = selected.icon;

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
      <div className="h-full flex flex-col gap-2">
        <div className="flex-none space-y-2">
          <section className="relative h-[118px] overflow-hidden rounded-[1.3rem] shadow-[0_10px_22px_rgba(0,0,0,0.28)]">
            <img src={bannerImage} alt="Decifra Músicas" className="absolute inset-0 h-full w-full object-cover" />
          </section>

          <div className="flex items-center justify-between gap-2">
            <h2 className="serif text-[2.05rem] leading-none text-[#1F1A17]">{title}</h2>
            <button
              type="button"
              onClick={onNewSearch}
              className="inline-flex h-8.5 items-center gap-1.5 rounded-full border border-[#E4D4C1] bg-[#FFFDF8] px-2.5 text-[0.84rem] font-semibold text-[#3A2D1F]"
            >
              <Search size={15} strokeWidth={1.9} />
              Nova busca
            </button>
          </div>

          <section className="grid grid-cols-4 rounded-[1.05rem] border border-[#E4D4C1] bg-[#FFFDF8] px-1 py-0.5">
            {[
              { id: 'essencia', label: 'ESSÊNCIA', icon: Sparkles, active: true },
              { id: 'notas', label: 'NOTAS', icon: Star, active: false },
              { id: 'leitura', label: 'LEITURA CRÍTICA', icon: BookOpen, active: false },
              { id: 'contexto', label: 'CONTEXTO', icon: Landmark, active: false },
            ].map((tab, idx) => {
              const Icon = tab.icon;
              return (
                <div key={tab.id} className={`px-1 py-1 text-center ${idx < 3 ? 'border-r border-[#E7DACA]' : ''}`}>
                  <div className={`mb-0.5 flex items-center justify-center gap-1 text-[0.6rem] font-bold tracking-wide ${tab.active ? 'text-[#2A2018]' : 'text-[#3B2F24]'}`}>
                    <Icon size={11} className={tab.active ? 'text-[#C8871A]' : 'text-[#A56C1A]'} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.active ? <div className="mx-auto h-[2px] w-12 rounded-full bg-[#C8871A]" /> : <div className="h-[2px]" />}
                </div>
              );
            })}
          </section>

          <section className="grid grid-cols-2 gap-2">
            <div className="rounded-[1.15rem] border border-[#E4D4C1] bg-[#FFFDF8] px-2.5 pb-2 pt-1.5">
              <div className="-mt-0.5 flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8DCCB] bg-white text-[#2A2018]">
                  <Star size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-[0.9rem] text-[#2C241D]">Nota Geral</p>
                  <div className="flex items-baseline gap-1">
                    <span className="serif text-[1.95rem] leading-none text-[#B87617] tabular-nums">{overallRating}</span>
                    <span className="text-[1.2rem] leading-none text-[#2C241D]">/10</span>
                  </div>
                </div>
              </div>
              <button type="button" className="mt-1.5 inline-flex h-7.5 w-full items-center justify-center gap-1.5 rounded-full border border-[#E6D7C5] bg-[#FFF8EC] px-2 text-[0.64rem] font-semibold text-[#2D231B] whitespace-nowrap">
                <Grid3X3 size={12} className="text-[#C8871A] flex-shrink-0" />
                9 espaços de respostas
                <ChevronDown size={12} className="-rotate-90 text-[#A56D1A] flex-shrink-0" />
              </button>
            </div>

            <div className="rounded-[1.15rem] border border-[#E4D4C1] bg-[#FFFDF8] p-2">
              <div className="flex gap-2">
                <img src={artistImage} alt="Artista" className="h-[90px] w-[68px] rounded-xl object-cover bg-[#E9DFD2]" />
                <div className="min-w-0">
                  <p className="serif text-[1.22rem] leading-none text-[#1F1A17]">John Lennon</p>
                  <div className="mt-1 space-y-0.5 text-[0.63rem] text-[#2C251F] leading-snug">
                    <p><strong>Banda:</strong> The Beatles</p>
                    <p><strong>Gênero:</strong> {compactGenre}</p>
                    <p><strong>Ano:</strong> {result.info?.year || '1971'}</p>
                  </div>
                  <span className="mt-1 inline-flex rounded-full border border-[#E5D6C5] bg-[#F8EBDD] px-2 py-0.5 text-[0.58rem] font-semibold text-[#5E4A35] whitespace-nowrap">
                    Compositor
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-[#D8C9B8]" />
        </div>

        <section className="flex-1 min-h-0 rounded-[1.15rem] border border-[#DCCBB7] bg-[#EEE7DC] p-2 overflow-hidden">
          {!isSectionOpen ? (
            <div className="h-full grid grid-cols-2 gap-1.5 content-start">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = selectedSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    aria-label={`Selecionar seção ${section.title}`}
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setIsSectionOpen(true);
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
          ) : (
            <div className="h-full min-h-0 rounded-[0.95rem] border border-[#DCCBB7] bg-[#FFFDF8] p-2 flex flex-col">
              <div className="mb-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Voltar para lista de seções"
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

export default MusicResultScreen;

