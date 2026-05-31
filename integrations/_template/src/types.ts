export interface __EXT_PASCAL__Config {
  apiKey: string;
}

export interface __EXT_PASCAL__Item {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
}

export interface __EXT_PASCAL__DataResponse {
  configured: boolean;
  items: __EXT_PASCAL__Item[];
}
