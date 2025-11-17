import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CardFactory from '../src/components/CardFactory';

// Wrapper for components that need Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CardFactory - Factory Pattern', () => {
  const mockProjectProps = {
    id: '1',
    title: 'Test Project',
    creator: 'John Doe',
    image: 'https://example.com/image.jpg',
    fundingGoal: 10000,
    fundingCurrent: 5000,
    daysLeft: 30,
    category: 'Technology',
  };

  it('should create ProjectCard for project type', () => {
    const card = CardFactory.createCard('project', mockProjectProps);
    
    render(card, { wrapper: RouterWrapper });

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  it('should create FeaturedProjectCard for featured type', () => {
    const card = CardFactory.createCard('featured', mockProjectProps);
    
    render(card, { wrapper: RouterWrapper });

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should create CreatorCard for creator type', () => {
    const creatorProps = {
      id: '1',
      name: 'Jane Smith',
      bio: 'Creative designer',
      projects: 5,
      backers: 100,
    };

    const card = CardFactory.createCard('creator', creatorProps);
    
    expect(card).toBeDefined();
    expect(card.type.name).toBe('CreatorCard');
  });

  it('should default to ProjectCard for unknown type', () => {
    const card = CardFactory.createCard('unknown' as any, mockProjectProps);

    expect(card.type.name).toBe('ProjectCard');
  });

  it('should create multiple cards from array', () => {
    const items = [
      { ...mockProjectProps, id: '1', type: 'project' as const },
      { ...mockProjectProps, id: '2', type: 'featured' as const, title: 'Featured Project' },
    ];

    const cards = CardFactory.createCards(items);

    expect(cards).toHaveLength(2);
    expect(cards[0].key).toBe('1');
    expect(cards[1].key).toBe('2');
  });

  it('should handle missing type in createCards', () => {
    const items = [
      { ...mockProjectProps, id: '1' },
    ];

    const cards = CardFactory.createCards(items);

    expect(cards).toHaveLength(1);
    expect(cards[0].type.name).toBe('ProjectCard');
  });

  it('should pass all props to created component', () => {
    const card = CardFactory.createCard('project', mockProjectProps);
    
    render(card, { wrapper: RouterWrapper });

    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });
});
