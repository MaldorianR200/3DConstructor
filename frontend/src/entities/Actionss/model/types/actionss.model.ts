export interface IActionss {
  id?: number;
  name: string;
  price: number;
  type: string;
  active: boolean;
  comment?: string;
}

export interface IActionssResponse {
  content: IActionss[];
  totalPages: number;
  totalElements: number;
}
