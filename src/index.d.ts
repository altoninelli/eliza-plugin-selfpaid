export interface ActionExample {
  user: string;
  content: {
    text: string;
    action?: string;
  };
}

export interface Action {
  name: string;
  similes: string[];
  description: string;
  validate: (runtime: any, message: any, state?: any) => Promise<boolean>;
  handler: (
    runtime: any,
    message: any,
    state?: any,
    options?: any,
    callback?: (response: any) => void
  ) => Promise<boolean>;
  examples: ActionExample[][];
}

export interface Provider {
  get: (runtime: any, message: any, state?: any) => Promise<string>;
}

export interface Plugin {
  name: string;
  description: string;
  actions: Action[];
  providers: Provider[];
  evaluators?: any[];
  services?: any[];
}

export declare const selfPaidPlugin: Plugin;
export default selfPaidPlugin;

export declare const actions: {
  zeroCostPaymentAction: Action;
  checkYieldRatesAction: Action;
  checkTreasuryAction: Action;
  redeemCollateralAction: Action;
};

export declare const providers: {
  selfPaidProvider: Provider;
};

export declare const api: {
  getRates: () => Promise<any>;
  getQuote: (params: any) => Promise<any>;
  buildPayment: (params: any) => Promise<any>;
  getTreasury: (wallet: string) => Promise<any>;
  buildWithdrawal: (params: any) => Promise<any>;
};
