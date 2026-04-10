import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const GlassSelect = ({ value, options, onChange, disabled, className, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className={`relative ${className || ''}`} ref={selectRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-full min-h-[48px] pl-4 pr-10 bg-white/5 border ${isOpen ? 'border-primary' : 'border-white/10'} rounded-xl text-xs font-bold text-white uppercase tracking-widest flex items-center cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'} select-none`}
      >
        <span className={`${selectedOption?.colorClass || 'text-white'} truncate flex-1`}>
          {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
        </span>
        <ChevronDown className={`absolute right-4 text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full mt-2 py-2 glass-card border border-white/10 shadow-2xl animate-page-enter max-h-60 overflow-y-auto outline-none" style={{ minWidth: '100%' }}>
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all hover:bg-white/10 ${String(option.value) === String(value) ? 'bg-primary/20 text-primary' : (option.colorClass || 'text-white')}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlassSelect;
