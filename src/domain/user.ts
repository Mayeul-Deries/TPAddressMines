export class User {

  id?: string;
  surname: string;
  name: string
  age: number;
  email: string;
  height: number;
  weight: number;
  main_sport: 'Running' | 'Swimming' | 'Weightlifting' | 'FootBall' | 'BasketBall';
  nationality: string;

  constructor(surname: string, name: string, age: number, email: string, height: number, weight: number, main_sport: 'Running' | 'Swimming' | 'Weightlifting' | 'FootBall' | 'BasketBall', nationality: string, id?: string) {
    this.id = id;
    this.surname = surname;
    this.name = name;
    this.age = age;
    this.email = email;
    this.height = height;
    this.weight = weight;
    this.main_sport = main_sport;
    this.nationality = nationality;
  }

  getFullAddress(): string {
    return `${this.surname}, ${this.name}, ${this.age}, ${this.email}, ${this.height}, ${this.weight}, ${this.main_sport}, ${this.nationality}`;
  }
}

