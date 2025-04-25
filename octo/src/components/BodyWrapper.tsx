'use client';
import { useAppContext } from '../context/AppContext';
import { useEffect, useState } from 'react';

const BodyWrapper = ({ children }: { children: React.ReactNode }) => {
  const { background } = useAppContext();
  const [bgStyle, setBgStyle] = useState({ opacity: 0, backgroundImage: '' });

  useEffect(() => {
    if (!background) return;
    setBgStyle({ opacity: 0, backgroundImage: `url(${background})` });
    const timeout = setTimeout(() => {
      setBgStyle({ opacity: 1, backgroundImage: `url(${background})` });
    }, 100); // Delay to allow transition
    return () => clearTimeout(timeout);
  }, [background]);

  return (
    <body className="text-white">
      <div
        style={{
          ...bgStyle,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'opacity 0.6s ease-in-out',
        }}
        className="fixed inset-0 z-[-1]"
      />
      <div className="relative z-10 bg-black/60 min-h-screen">{children}</div>
    </body>
  );
};

export default BodyWrapper;
