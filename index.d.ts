interface ILassoOptions {
  element: HTMLImageElement;
  radius?: number;
  fps?: number;
  onChange?: (polygon: string) => void;
  onUpdate?: (polygon: string) => void;
}

function createLasso (options: ILassoOptions): void;
export = createLasso;
