import React from 'react';

interface LegalLinksProps {
  className?: string;
  light?: boolean;
}

export const LegalLinks: React.FC<LegalLinksProps> = ({ className = '', light = false }) => {
  const linkStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: light ? 'rgba(255, 255, 255, 0.5)' : '#8e8377',
    textDecoration: 'none',
    margin: '0 8px',
    transition: 'color 0.2s ease',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px 0',
    width: '100%',
  };

  return (
    <div className={`legal-links-container ${className}`} style={containerStyle}>
      <a 
        href="/politica-de-privacidade.html" 
        target="_blank" 
        rel="noopener noreferrer"
        style={linkStyle}
        onMouseOver={(e) => (e.currentTarget.style.color = '#D5A54A')}
        onMouseOut={(e) => (e.currentTarget.style.color = light ? 'rgba(255, 255, 255, 0.5)' : '#8e8377')}
      >
        Política de Privacidade
      </a>
      <span style={{ color: light ? 'rgba(255, 255, 255, 0.2)' : '#ccc' }}>•</span>
      <a 
        href="/termos-de-uso.html" 
        target="_blank" 
        rel="noopener noreferrer"
        style={linkStyle}
        onMouseOver={(e) => (e.currentTarget.style.color = '#D5A54A')}
        onMouseOut={(e) => (e.currentTarget.style.color = light ? 'rgba(255, 255, 255, 0.5)' : '#8e8377')}
      >
        Termos de Uso
      </a>
    </div>
  );
};
