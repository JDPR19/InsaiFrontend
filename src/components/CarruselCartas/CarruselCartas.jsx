import React, { useRef, useState, useEffect } from 'react';

const CardsCarousel = ({ items = [], renderCard, height = 160 }) => {
  const ref = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e) => {
      // Desplaza horizontal con la rueda
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onMouseDown = (e) => {
    const el = ref.current;
    if (!el) return;
    setIsDown(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
    el.classList.add('is-dragging');
  };
  const onMouseLeave = () => {
    setIsDown(false);
    ref.current?.classList.remove('is-dragging');
  };
  const onMouseUp = () => {
    setIsDown(false);
    ref.current?.classList.remove('is-dragging');
  };
  const onMouseMove = (e) => {
    const el = ref.current;
    if (!isDown || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1; // velocidad
    el.scrollLeft = scrollLeft - walk;
  };

  // Touch (móvil)
  const touchRef = useRef({ x: 0, left: 0 });
  const onTouchStart = (e) => {
    const el = ref.current;
    if (!el) return;
    touchRef.current.x = e.touches[0].pageX;
    touchRef.current.left = el.scrollLeft;
    el.classList.add('is-dragging');
  };
  const onTouchMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const dx = e.touches[0].pageX - touchRef.current.x;
    el.scrollLeft = touchRef.current.left - dx;
  };
  const onTouchEnd = () => ref.current?.classList.remove('is-dragging');

  const scrollByStep = (dir = 1) => {
    const el = ref.current;
    if (!el) return;
    const step = Math.max(260, Math.floor(el.clientWidth * 0.9));
    el.scrollTo({ left: el.scrollLeft + step * dir, behavior: 'smooth' });
  };

  return (
    <div className="carouselWrap" style={{ ['--card-height']: `${height}px` }}>
      <button className="carouselBtn prev" onClick={() => scrollByStep(-1)} aria-label="Anterior">‹</button>
      <div
        ref={ref}
        className="carouselTrack edgeFade"
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {items.map((item, idx) => (
          <div key={item.id ?? idx} className="carouselCard">
            {renderCard ? renderCard(item) : (
              <div className="carouselCardBody">
                <div className="carouselCardTitle">{item.title || 'Título'}</div>
                <div className="carouselCardSub">{item.subtitle || ''}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="carouselBtn next" onClick={() => scrollByStep(1)} aria-label="Siguiente">›</button>
    </div>
  );
};

export default CardsCarousel;