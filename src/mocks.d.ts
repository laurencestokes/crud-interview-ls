declare module '*/mocks/browser' {
  export const worker: {
    start: () => Promise<void>;
    stop: () => Promise<void>;
  };
}

declare module '*/mocks/handlers' {
  export const handlers: any[];
}

declare module '*/mocks/db' {
  export const db: {
    user: {
      getAll: () => Promise<any[]>;
      findFirst: (query: any) => Promise<any>;
      create: (data: any) => Promise<any>;
      update: (params: any) => Promise<any>;
      delete: (params: any) => Promise<any>;
    };
  };
}
