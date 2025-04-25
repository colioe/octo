declare global {
    interface Window {
      adsbygoogle?: { push: (config: unknown) => void }[];
    }
  }