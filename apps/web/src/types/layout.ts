export type RecordingLayout = 'pip' | 'circle';

export interface LayoutConfig {
  id: RecordingLayout;
  name: string;
  description: string;
}

export const LAYOUT_OPTIONS: LayoutConfig[] = [
  {
    id: 'pip',
    name: 'Picture in Picture',
    description: 'Camera overlay on screen',
  },
  {
    id: 'circle',
    name: 'Circle Camera',
    description: 'Circular camera overlay',
  },
];