import React from 'react';
import ProjectCard from './ProjectCard';
import FeaturedProjectCard from './FeaturedProjectCard';
import CreatorCard from './CreatorCard';

type CardType = 'project' | 'featured' | 'creator';

interface BaseCardProps {
  id: string;
  title?: string;
  [key: string]: any;
}

class CardFactory {
  static createCard(
    type: CardType, 
    props: BaseCardProps
  ): React.ReactElement {
    const componentMap = {
      project: ProjectCard,
      featured: FeaturedProjectCard,
      creator: CreatorCard,
    };

    const Component = componentMap[type];
    
    if (!Component) {
      console.warn(`Unknown card type: ${type}, defaulting to ProjectCard`);
      return <ProjectCard {...props} />;
    }

    return <Component key={props.id} {...props} />;
  }

  static createCards(
    items: Array<BaseCardProps & { type?: CardType }>
  ): React.ReactElement[] {
    return items.map((item) => {
      const type = item.type || 'project';
      const { type: _, ...props } = item;
      return CardFactory.createCard(type, props);
    });
  }
}

export default CardFactory;
