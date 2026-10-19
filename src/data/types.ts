export interface Category {
  id: string
  name: string
  emoji: string
  description: string
}

export interface Animal {
  id: string
  name: string
  categories: string[]
  description: string
  animalClass: string
  habitat: string
  photo: string
  sounds: string[]
  silent: boolean
  credit: string
}