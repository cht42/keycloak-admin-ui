export interface IUser {
  id?: string;
  username?: string;
  password?: string;
}

export interface IBucket {
  name: string;
  creationDate: string;
}

export interface IGroup {
  id: string;
  name: string;
  path: string;
}
