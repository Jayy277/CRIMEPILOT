import React from 'react';
import mapImage from '../photos/map.png';

const NationalIntelMap = () => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '580px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <img
        src={mapImage}
        alt="National Crime Intelligence Command // Official Republic of India"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default NationalIntelMap;
