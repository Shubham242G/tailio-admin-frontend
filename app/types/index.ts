export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'salesman' | 'admin';
}

export interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  owner: string;
}

export interface RegistrationForm {
  _id: string;
  pet: Pet;
  name: string;
  city: string;
  animal: string;
  breed: string;
  documents: Array<{
    name: string;
    data: string;
    contentType: string;
  }>;
  isFilled: boolean;
}
