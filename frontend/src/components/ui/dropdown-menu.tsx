/**
 * 🎸 Dropdown Menu Component - Shadcn/UI Style
 * Cyberpunk-themed dropdown menus for actions
 */

import * as React from 'react';

// ============================================================================
// DROPDOWN MENU ROOT
// ============================================================================

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

// ============================================================================
// DROPDOWN MENU TRIGGER
// ============================================================================

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ asChild, children }) => {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      'aria-expanded': isOpen,
      'aria-haspopup': true,
    });
  }

  return (
    <button onClick={handleClick} aria-expanded={isOpen} aria-haspopup="true">
      {children}
    </button>
  );
};

// ============================================================================
// DROPDOWN MENU CONTENT
// ============================================================================

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  align = 'end',
  className = '',
}) => {
  const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Close on Escape
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={contentRef}
      className={`
        absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md
        border border-slate-700 bg-slate-800 p-1 shadow-lg shadow-black/50
        animate-in fade-in-0 zoom-in-95
        ${alignmentClasses[align]}
        ${className}
      `}
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>
  );
};

// ============================================================================
// DROPDOWN MENU ITEM
// ============================================================================

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className = '',
  disabled = false,
  onClick,
}) => {
  const { setIsOpen } = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      setIsOpen(false);
    }
  };

  return (
    <button
      className={`
        relative flex w-full cursor-pointer select-none items-center rounded-sm
        px-2 py-1.5 text-sm outline-none transition-colors
        hover:bg-slate-700 focus:bg-slate-700
        ${disabled ? 'pointer-events-none opacity-50' : ''}
        ${className}
      `}
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// ============================================================================
// DROPDOWN MENU SEPARATOR
// ============================================================================

const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`-mx-1 my-1 h-px bg-slate-700 ${className}`} role="separator" />;
};

// ============================================================================
// DROPDOWN MENU LABEL
// ============================================================================

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold text-slate-400 ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
