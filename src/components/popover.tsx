import { useEffect, useState } from 'preact/hooks';
import { h, FunctionalComponent } from 'preact';

type PopoverProps = {
  content: string | h.JSX.Element;
  children: h.JSX.Element;
};

const Popover: FunctionalComponent<PopoverProps> = (props) => {
  const [isInit, setIsInit] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const maxPopoverWidth = 200;
    const popoverPadding = 10;

    const x = Math.min(
      clientX + 0,
      screenWidth - maxPopoverWidth - popoverPadding
    );
    const y = Math.min(
      clientY + 60,
      screenHeight - popoverPadding
    );

    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsInit(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      onMouseMove={(e) => handleMouseMove(e as unknown as MouseEvent)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {props.children}
      {isVisible && (
        <div
          className={`absolute bg-black text-white px-4 py-3 text-center text-xs rounded-xl z-10 pointer-events-none transition-opacity transform -translate-x-1/2 -translate-y-1/2 max-w-[200px] break-word after:content-[''] after:absolute after:-top-3.5 after:left-1/2 after:transform after:-translate-x-1/2 after:w-0 after:h-0 after:border-8 after:border-t-transparent after:border-x-transparent after:border-b-black`}
          style={{
            opacity: isInit ? 0 : 1,
            top: `${position.y}px`,
            left: `${position.x}px`,
          }}
        >
          {props.content}
        </div>
      )}
    </div>
  )
}

export default Popover