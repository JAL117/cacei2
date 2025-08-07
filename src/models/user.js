
export const USER_ROLES = {
  DIRECTOR: 'director',
  TUTOR: 'tutor',
  DOCENTE: 'docente',
}

export class User {
  constructor({ id, nombre, rol }) {
    this.id = id
    this.nombre = nombre
    this.rol = rol 
  }
}
