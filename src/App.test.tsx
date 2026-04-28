import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('App shell', () => {
  it('renders bottom navigation items', () => {
    render(<App />);
    const navigation = screen.getByRole('navigation');
    const nav = within(navigation);

    expect(nav.getByRole('button', { name: /home/i })).toBeInTheDocument();
    expect(nav.getByRole('button', { name: /filmes e séries/i })).toBeInTheDocument();
    expect(nav.getByRole('button', { name: /livros/i })).toBeInTheDocument();
    expect(nav.getByRole('button', { name: /músicas/i })).toBeInTheDocument();
    expect(nav.getByRole('button', { name: /loja/i })).toBeInTheDocument();
    expect(nav.getByRole('button', { name: /config\./i })).toBeInTheDocument();
  });
});
