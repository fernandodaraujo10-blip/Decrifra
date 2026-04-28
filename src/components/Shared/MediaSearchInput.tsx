import React, { useState, useRef } from 'react';
import { Search, Camera, X } from 'lucide-react';

export interface MediaSearchInputProps {
  /** Placeholder dinâmico para o input de texto */
  placeholder?: string;
  /** Valor atual do input de texto */
  value: string;
  /** Evento disparado ao digitar no input */
  onChangeText: (text: string) => void;
  /** Evento disparado quando o usuário tira foto, faz upload ou cola uma imagem */
  onImageSelect: (file: File | null) => void;
  /** (Opcional) Ação disparada ao apertar "Enter" */
  onSubmit?: () => void;
}

export const MediaSearchInput: React.FC<MediaSearchInputProps> = ({
  placeholder = 'Ex.: Matrix, Interestelar, O Poderoso Chefão...',
  value,
  onChangeText,
  onImageSelect,
  onSubmit
}) => {
  // Estados para exibição do feedback visual da imagem
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processa o arquivo recebido (via upload ou paste)
  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setImageFile(file);
      onImageSelect(file);
      
      // Cria URL local para o preview
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // Acionado ao selecionar arquivo pela janela do SO ou ao tirar foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Permite que o usuário use "Ctrl+V" no input para colar uma imagem direto da área de transferência
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
          const file = e.clipboardData.items[i].getAsFile();
          if (file) {
            processFile(file);
            e.preventDefault(); // Impede que cole texto da imagem
            break;
          }
        }
      }
    }
  };

  // Limpa a seleção da imagem e restaura o input file
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Aciona submit no "Enter" se fornecido
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Container Principal: Pílula (rounded-full) com borda fina dourada clara */}
      <div className="relative flex items-center w-full min-h-[56px] px-2 bg-[#FDFBF7] rounded-full border border-[#E8D8B0] shadow-[0_2px_10px_rgba(197,160,89,0.05)] transition-all focus-within:border-[#C5A059] focus-within:ring-4 focus-within:ring-[#C5A059]/10 focus-within:bg-white">
        
        {/* Ícone da Esquerda (Search) */}
        <div className="flex items-center justify-center pl-3 text-[#D4AF37]">
          <Search size={20} strokeWidth={1.5} />
        </div>

        {/* Input de Texto */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow h-12 px-3 bg-transparent text-zinc-800 placeholder:text-zinc-400 text-sm focus:outline-none"
        />

        {/* Botão para limpar texto (Opcional, aparece se houver texto) */}
        {value && !imageFile && (
          <button 
            onClick={() => onChangeText('')}
            className="flex items-center justify-center p-1 mr-1 text-zinc-400 hover:text-zinc-600 transition-colors"
            aria-label="Limpar pesquisa"
          >
            <X size={16} />
          </button>
        )}

        {/* Botão da Câmera (Upload / Captura Nativa) */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 mr-1 rounded-xl border border-[#E8D8B0] text-[#C5A059] hover:bg-[#C5A059]/5 transition-colors focus:outline-none active:scale-95"
          aria-label="Tirar foto ou anexar imagem"
        >
          <Camera size={20} strokeWidth={1.5} />
        </button>

        {/* Input File Oculto com capture="environment" para câmera traseira nativa */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Feedback Visual: Thumbnail da Imagem Selecionada */}
      {imagePreview && (
        <div className="flex items-center gap-3 p-2 bg-white border border-[#E8D8B0] rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
          {/* Miniatura */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 flex-shrink-0">
            <img src={imagePreview} alt="Preview da Câmera" className="w-full h-full object-cover" />
          </div>
          
          {/* Informações */}
          <div className="flex flex-col flex-grow overflow-hidden">
            <span className="text-xs font-bold text-[#4A3728] truncate">Mídia anexada</span>
            <span className="text-[10px] text-zinc-500 truncate">
              {imageFile?.name || 'Imagem colada da área de transferência'}
            </span>
          </div>
          
          {/* Botão Remover Imagem */}
          <button 
            onClick={clearImage}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0 mr-1"
            aria-label="Remover imagem"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
