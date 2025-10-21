import React from 'react';

const Image = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} loading="lazy" />
);

export default Image;