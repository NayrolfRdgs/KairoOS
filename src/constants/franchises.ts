import { FranchiseCollection } from '../types';

export const POPULAR_FRANCHISES: FranchiseCollection[] = [
  {
    id: 'mario',
    name: 'Super Mario',
    color: 'bg-red-50 text-red-600 border-red-200',
    keywords: ['mario', 'luigi', 'wario', 'yoshi', 'kart', 'donkey kong'],
  },
  {
    id: 'zelda',
    name: 'The Legend of Zelda',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    keywords: ['zelda', 'link'],
  },
  {
    id: 'pokemon',
    name: 'Pokémon',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    keywords: ['pokemon', 'pokémon'],
  },
  {
    id: 'sonic',
    name: 'Sonic The Hedgehog',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    keywords: ['sonic'],
  },
  {
    id: 'versus',
    name: 'Street Fighter & Tekken',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    keywords: ['street fighter', 'tekken', 'mortal kombat', 'king of fighters', 'guilty gear'],
  },
  {
    id: 'rpg',
    name: 'Final Fantasy & RPG',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    keywords: ['final fantasy', 'dragon quest', 'chrono', 'persona', 'tales of'],
  },
];
