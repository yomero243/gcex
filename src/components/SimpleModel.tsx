import { useGLTF } from '@react-three/drei';

export const SimpleModel = () => {
  const { scene } = useGLTF('/fake.glb');
  return <primitive object={scene} />;
};
