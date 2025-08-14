export interface WhitelistedIP {
  id: string;
  ip: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface WhitelistResponse {
  success: boolean;
  message: string;
  data: WhitelistedIP[];
}

export interface AddWhitelistResponse {
  success: boolean;
  message: string;
  data: WhitelistedIP;
}

export interface AddWhitelistRequest {
  ip: string;
}
