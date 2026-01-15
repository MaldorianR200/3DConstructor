export interface ISpecification {
  id?: number;
  typeProductId: number;
  typeExecutionId: number;
  series: string;
  material?: Array<{ objectId: number; coefficient: number }>;
  combineMaterial?: Array<{ objectId: number; coefficient: number }>;
  furniture?: Array<{ objectId: number; coefficient: number }>;
  colorCategory?: Array<{ objectId: number; coefficient: number }>;
  color?: Array<{ objectId: number; coefficient: number }>;
  operation?: Array<{ objectId: number; coefficient: number }>;
  fastener?: Array<{ objectId: number; coefficient: number }>;
  milling?: Array<{ objectId: number; coefficient: number }>;
  active: boolean;
  comment?: string;
}

export interface ISpecificationResponse {
  content: ISpecification[];
  totalPages: number;
  totalElements: number;
}
