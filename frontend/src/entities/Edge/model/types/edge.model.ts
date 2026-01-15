export interface IEdge {
  id?: number;
  name: string;
  thickness: number;
  active: boolean;
  comment?: string;
}

export interface IEdgeResponse {
  content: IEdge[];
  totalPages: number;
  totalElements: number;
}
