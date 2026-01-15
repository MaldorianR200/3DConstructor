export interface IFasteners {
  id?: number;
  name: string;
  price: number;
  active: boolean;
  comment?: string;
}

export interface IFastenersResponse {
  content: IFasteners[];
  totalPages: number;
  totalElements: number;
}
