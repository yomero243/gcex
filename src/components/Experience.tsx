/* eslint-disable react/no-unknown-property */
import React from 'react';
import Scene from './Scene';

const Experience: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#07080a']} />
      <fogExp2 attach="fog" args={['#07080a', 0.021]} />
      <Scene />
    </>
  );
};

export default Experience;
