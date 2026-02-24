import React from 'react';

const GlassCard = ({ children, className = '', hoverEffect = false, ...props }) => {
    return (
        <div
            className={`
        glass-panel rounded-2xl p-6 
        ${hoverEffect ? 'transition-transform duration-300 hover:scale-[1.02] hover:shadow-neon-cyan/20' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
