export interface HandleGrowlConfig {
  type: string;
  message: string;
}

export function handleGrowl(store: any, { type, message }: HandleGrowlConfig) {
  store.dispatch(
    `growl/${type}`,
    {
      title: "Error",
      message,
      timeout: 5000,
    },
    { root: true },
  );
}
