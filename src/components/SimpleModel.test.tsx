import ReactThreeTestRenderer from '@react-three/test-renderer';
import { SimpleModel } from './SimpleModel';
import * as THREE from 'three';

vi.mock('@react-three/drei', async (importOriginal) => {
  const original = await importOriginal();
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
    const primitive = renderer.scene.findByType('primitive');
    expect(primitive).toBeDefined();
  });
});
