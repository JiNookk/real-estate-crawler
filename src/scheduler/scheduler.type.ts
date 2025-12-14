export interface TargetConfig {
  name: string;
  baseUrl: string;
  searchParams: {
    region: string;
    size?: string;
    floorType?: 'underground' | 'ground' | 'rooftop';
  };
}

export interface TargetsConfig {
  targets: TargetConfig[];
}
