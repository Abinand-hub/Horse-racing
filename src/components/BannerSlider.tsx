import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Flame } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BannerSliderProps {
  banners: Banner[];
  onSelectRace?: (raceId: string) => void;
  onOpenDeposit?: () => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  banners,
  onSelectRace,
  onOpenDeposit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const defaultHorseBanners: Banner[] = [
    {
      id: 'bnr_01',
      title: 'Bangalore Derby 2026',
      subtitle: 'India’s Richest Classic • Place Win & Place Bets with Top Real-Time Odds',
      image_url: '/images/race_action.jpg',
      link: '/race/race_sfc_07',
      tag: 'GRADE 1 DERBY FEATURE',
      is_active: true,
    },
    {
      id: 'bnr_02',
      title: 'Monsoon Racing Season',
      subtitle: 'Pune & Mumbai Race Course Live • Fast UPI Deposits & Instant Settlements',
      image_url: '/images/jockey_hero.jpg',
      link: '/race/race_pune_02',
      tag: 'LIVE ACTION',
      is_active: true,
    },
    {
      id: 'bnr_03',
      title: 'Champion Thoroughbreds & Live Odds',
      subtitle: 'Exclusive runners with real-time exposure tracking and instant returns',
      image_url: '/images/horse_runner.jpg',
      link: '/race/race_sfc_07',
      tag: 'HOT DERBY SPECIAL',
      is_active: true,
    },
  ];

  const activeBanners = banners && banners.length > 0
    ? banners.filter((b) => b.is_active)
    : defaultHorseBanners;

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex] || activeBanners[0];

  const handleBannerClick = () => {
    soundManager.playClick();
    if (!current.link) return;
    if (current.link.startsWith('/race/')) {
      const raceId = current.link.replace('/race/', '');
      onSelectRace?.(raceId);
    } else if (current.link === '#deposit') {
      onOpenDeposit?.();
    }
  };

  const getHorseImageFallback = (imgUrl?: string, index: number = 0) => {
    if (imgUrl && !imgUrl.includes('unsplash.com')) return imgUrl;
    const fallbacks = [
      '/images/race_action.jpg',
      '/images/jockey_hero.jpg',
      '/images/horse_runner.jpg',
    ];
    return fallbacks[index % fallbacks.length];
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl group">
      <div 
        onClick={handleBannerClick}
        className="relative h-48 sm:h-64 md:h-72 lg:h-80 w-full cursor-pointer overflow-hidden"
      >
        {/* Cinematic Horse Racing Background Image */}
        <img
          src={getHorseImageFallback(current.image_url, currentIndex)}
          alt={current.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/race_action.jpg';
          }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 brightness-[0.72]"
        />
        
        {/* Dynamic Dark Gradient Overlays for readable text */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />

        {/* Content Box */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 max-w-2xl space-y-2">
          {current.tag && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] sm:text-xs font-black tracking-wider uppercase w-fit backdrop-blur-md shadow">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-current" />
              {current.tag}
            </div>
          )}

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-lg leading-tight">
            {current.title}
          </h2>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 line-clamp-2 max-w-lg leading-relaxed drop-shadow">
            {current.subtitle}
          </p>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 group-hover:from-rose-500 group-hover:to-red-500 group-hover:scale-105 transition-all">
              Explore Fixture
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            id="banner-prev-btn"
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playClick();
              setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 transition opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-md active:scale-95 shadow-lg"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            id="banner-next-btn"
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playClick();
              setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 transition opacity-0 group-hover:opacity-100 cursor-pointer backdrop-blur-md active:scale-95 shadow-lg"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  soundManager.playClick();
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-7 bg-rose-500' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
