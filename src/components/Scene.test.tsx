import ReactThreeTestRenderer from '@react-three/test-renderer';
import Scene from './Scene';

// Mock the useGLTF hook as it relies on a real file system
vi.mock('@react-three/drei', async (importOriginal) => {
  const original = await importOriginal<typeof import('@react-three/drei')>();
  const THREE = await import('three');
  const mockObject3D = new THREE.Object3D();
  mockObject3D.name = 'mock-scene';
  return {
    ...original,
    useGLTF: Object.assign(vi.fn().mockReturnValue({ scene: mockObject3D }), {
      preload: vi.fn(),
    }),
    useFBX: Object.assign(vi.fn().mockReturnValue(mockObject3D), {
      preload: vi.fn(),
    }),
    useAnimations: vi.fn().mockReturnValue({ actions: {} }),
    Environment: ({ children }: { children?: React.ReactNode }) => <group name="mock-env">{children}</group>,
    Lightformer: () => null,
  };
});

describe('Scene component', () => {
  it('should render the 3D scene graph children', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Scene />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
  });
});
