import { useGLTF } from '@react-three/drei';

export const SimpleModel = () => {
  const { scene } = useGLTF('/variusuvs3.glb');
  return <primitive object={scene} />;
};
