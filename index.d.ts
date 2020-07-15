interface ILassoOptions {
  element: HTMLImageElement;
  radius?: number;
  onChange?: (polygon: string) => void;
  onUpdate?: (polygon: string) => void;
}

interface LassoInstance {
  reset: () => void;
  setPath: (polygon: string) => void;
}

function createLasso (options: ILassoOptions): LassoInstance;
export = createLasso;
