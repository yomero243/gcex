import ReactThreeTestRenderer from '@react-three/test-renderer';
import Scene from './Scene';

// Mock the useGLTF hook as it relies on a real file system
vi.mock('@react-three/drei', async (importOriginal) => {
  const original = await importOriginal();
  const THREE = await import('three');
  const mockObject3D = new THREE.Object3D();
  mockObject3D.name = "mock-scene";
  return {
    ...original,
    useGLTF: Object.assign(vi.fn().mockReturnValue({ scene: mockObject3D }), {
      preload: vi.fn(),
    }),
    useAnimations: vi.fn().mockReturnValue({ actions: {} }),
  };
});

describe('Scene component', () => {
  it('should log the scene children', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Scene />);
    console.log(renderer.scene.children.map(c => c.type.displayName || c.type.name));
  });
});
