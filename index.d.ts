interface ILassoOptions {
  element: HTMLImageElement;
  radius?: number;
  onChange?: (polygon: string) => void;
  onUpdate?: (polygon: string) => void;
  enabled?: boolean;
}

interface LassoInstance {
  reset: () => void;
  setPath: (polygon: string) => void;
  enable: () => void;
  disable: () => void;
}

function createLasso (options: ILassoOptions): LassoInstance;
export = createLasso;
