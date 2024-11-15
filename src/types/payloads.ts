export interface XDMPayload {
  xdm?: {
    eventType: string;
    commerce?: Record<string, any>;
    productListItems?: Array<{
      SKU: string;
      name: string;
      quantity: number;
    }>;
    identityMap?: {
      Email: Array<{
        id: string;
        primary: boolean;
        authenticatedState: string;
      }>;
    };
  };
  personalization?: {
    surfaces: string[];
  };
}

export interface AlloyResponse {
  propositions?: Array<{
    id: string;
    scope: string;
    scopeDetails: Record<string, any>;
  }>;
  identity?: {
    ECID: string;
  };
}
