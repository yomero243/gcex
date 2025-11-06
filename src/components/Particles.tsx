import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  attribute float age;
  attribute float lifespan;
  varying float vAge;
  void main() {
    vAge = age / lifespan;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (1.0 - vAge) * 10.0;
  }
`;

const fragmentShader = `
  varying float vAge;
  void main() {
    vec3 color1 = vec3(1.0, 0.8, 0.2); // Yellow
    vec3 color2 = vec3(1.0, 0.2, 0.0); // Red
    vec3 finalColor = mix(color1, color2, vAge);
    gl_FragColor = vec4(finalColor, 1.0 - vAge);
  }
`;

const Particles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const mouse = useRef(new THREE.Vector2());

  const count = 5000;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        age: 0,
        lifespan: Math.random() * 2 + 1, // 1 to 3 seconds
      });
    }
    return temp;
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const ages = useMemo(() => new Float32Array(count), [count]);
  const lifespans = useMemo(() => new Float32Array(count), [count]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const { camera, raycaster } = useThree();
  const plane = useMemo(() => new THREE.Plane(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const { camera } = state;
    if (pointsRef.current) {
      // Update the plane to be in front of the camera
      plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(plane.normal), camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(5)));

      raycaster.setFromCamera(mouse.current, camera);
      raycaster.ray.intersectPlane(plane, target);

      for (let i = 0; i < count; i++) {
        const particle = particles[i];
        particle.age += delta;

        if (particle.age > particle.lifespan) {
          particle.age = 0;
          particle.position.copy(target);
          const speed = Math.random() * 1 + 0.5; // Slower speed
          particle.velocity.set(
            (Math.random() - 0.5) * 0.5,
            speed, // Move upwards
            (Math.random() - 0.5) * 0.5
          );
        }

        particle.position.add(particle.velocity.clone().multiplyScalar(delta));

        const i3 = i * 3;
        positions[i3] = particle.position.x;
        positions[i3 + 1] = particle.position.y;
        positions[i3 + 2] = particle.position.z;

        ages[i] = particle.age;
        lifespans[i] = particle.lifespan;
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.age.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-age"
          count={ages.length}
          array={ages}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-lifespan"
          count={lifespans.length}
          array={lifespans}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        attach="material"
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={false} // Disable depth testing
      />
    </points>
  );
};

export default Particles;
