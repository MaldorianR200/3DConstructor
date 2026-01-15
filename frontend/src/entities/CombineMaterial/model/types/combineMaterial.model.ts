export interface ICombineMaterial {
  id?: number;
  name: string;
  materials: Array<{
    materialId: number;
    operations: Array<{
      type: string;
      typeId: number;
      price: number;
      count: number;
    }>;
  }>;
  active: boolean;
  comment?: string;
}

export interface ICombineMaterialResponse {
  content: ICombineMaterial[];
  totalPages: number;
  totalElements: number;
}
