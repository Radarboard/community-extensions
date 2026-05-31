export interface __EXT_PASCAL__Item {
  id: string;
  title: string;
  subtitle?: string;
}

export interface __EXT_PASCAL__Data {
  configured: boolean;
  totalCount: number;
  items: __EXT_PASCAL__Item[];
}
