export interface ITypes {
  id?: number;
  name: string;
  type: string;
  active: boolean;
  comment?: string;
  other?: string;
  facade?: boolean;
  body?: boolean;
  backWall?: boolean;
  additionFacade?: boolean;
  texture?: boolean;
}

export interface ITypesResponse {
  content: ITypes[];
  totalPages: number;
  totalElements: number;
}
