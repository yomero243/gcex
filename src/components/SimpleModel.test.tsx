import ReactThreeTestRenderer from '@react-three/test-renderer';
import { SimpleModel } from './SimpleModel';

vi.mock('@react-three/drei', async (importOriginal) => {
  const original = await importOriginal<typeof import('@react-three/drei')>();
  const THREE = await import('three');
  const mockObject3D = new THREE.Object3D();
  return {
    ...original,
    useGLTF: Object.assign(() => ({ scene: mockObject3D }), {
      preload: () => {},
    }),
  };
});

describe('SimpleModel', () => {
  it('should render a primitive', async () => {
    const renderer = await ReactThreeTestRenderer.create(<SimpleModel />);
    expect(renderer.scene.children.length).toBeGreaterThan(0);
  });
});
