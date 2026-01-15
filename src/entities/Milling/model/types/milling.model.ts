export interface IMilling {
  id?: number;
  name: string;
  steps: Array<{
      typeStepId: number;
      price: number;
      count: number;
    }>;
  active: boolean;
  comment?: string;
}

export interface IMillingResponse {
  content: IMilling[];
  totalPages: number;
  totalElements: number;
}
