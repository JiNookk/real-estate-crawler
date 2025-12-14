export interface CrawlResult {
  collectedAt: Date;
  platform: string;
  region: string;
  address: string;
  price: string;
  size: string;
  floor: string;
  roomType: string;
  originalUrl: string;
}

export interface SearchParams {
  region: string;
  size?: string;
  floorType?: 'underground' | 'ground' | 'rooftop';
}
