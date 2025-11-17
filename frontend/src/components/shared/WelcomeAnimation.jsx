// frontend/src/components/shared/WelcomeAnimation.jsx
import React, { useState, useEffect } from 'react';

const WelcomeAnimation = ({ onComplete }) => {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [showSecond, setShowSecond] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const line1 = 'Welcome to Merit College Portal';
  const line2 = 'Advance your Knowledge from its basic level...';

  useEffect(() => {
    let index1 = 0;
    const timer1 = setInterval(() => {
      if (index1 < line1.length) {
        setText1(prev => prev + line1[index1]);
        index1++;
      } else {
        clearInterval(timer1);
        setTimeout(() => setShowSecond(true), 300);
      }
    }, 80);

    return () => clearInterval(timer1);
  }, []);

  useEffect(() => {
    if (!showSecond) return;

    let index2 = 0;
    const timer2 = setInterval(() => {
      if (index2 < line2.length) {
        setText2(prev => prev + line2[index2]);
        index2++;
      } else {
        clearInterval(timer2);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onComplete, 1000);
        }, 2000);
      }
    }, 60);

    return () => clearInterval(timer2);
  }, [showSecond, onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-50 flex items-center justify-center transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
            <span className="text-4xl font-bold text-gray-900">MC</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif">
          {text1}
          <span className="animate-pulse">|</span>
        </h1>

        {showSecond && (
          <p className="text-xl md:text-2xl text-gray-300 font-light animate-pulse">
            {text2}
            <span className="animate-pulse">|</span>
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WelcomeAnimation;
