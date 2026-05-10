import { useRef, useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { useAuth } from '../../contexts/AuthContext'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

const SLIDES = [
  {
    image: '/images/hero/hero-slide-1.jpg',
    titleKey: 'heroCarousel.slide1.title',
    subtitleKey: 'heroCarousel.slide1.subtitle',
    ctaKey: 'heroCarousel.slide1.cta',
  },
  {
    image: '/images/hero/hero-slide-2.webp',
    titleKey: 'heroCarousel.slide2.title',
    subtitleKey: 'heroCarousel.slide2.subtitle',
    ctaKey: 'heroCarousel.slide2.cta',
  },
  {
    image: '/images/hero/hero-slide-3.jpg',
    titleKey: 'heroCarousel.slide3.title',
    subtitleKey: 'heroCarousel.slide3.subtitle',
    ctaKey: 'heroCarousel.slide3.cta',
  },
  {
    image: '/images/hero/hero-slide-4.jpg',
    titleKey: 'heroCarousel.slide4.title',
    subtitleKey: 'heroCarousel.slide4.subtitle',
    ctaKey: 'heroCarousel.slide4.cta',
  },
  {
    image: '/images/hero/hero-slide-5.jpg',
    titleKey: 'heroCarousel.slide5.title',
    subtitleKey: 'heroCarousel.slide5.subtitle',
    ctaKey: 'heroCarousel.slide5.cta',
  },
]

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
}

export default function HeroCarousel() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const swiperRef = useRef<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goTo = useCallback((index: number) => {
    swiperRef.current?.slideToLoop(index)
  }, [])

  const goPrev = useCallback(() => {
    swiperRef.current?.slidePrev()
  }, [])

  const goNext = useCallback(() => {
    swiperRef.current?.slideNext()
  }, [])

  const togglePause = useCallback(() => {
    const autoplay = swiperRef.current?.autoplay
    if (!autoplay) return
    if (isPaused) {
      autoplay.start()
    } else {
      autoplay.stop()
    }
    setIsPaused((p) => !p)
  }, [isPaused])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goPrev, goNext])

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label={t('heroCarousel.ariaLabel', 'Hero Carousel')}
    >
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop
        speed={1000}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-[600px] sm:h-[650px] md:h-[700px] lg:h-[750px]"
      >
        {SLIDES.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-full">
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[8000ms] ease-out"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: activeIndex === index ? 'scale(1.08)' : 'scale(1)',
                }}
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* German flag accent line */}
              <div className="absolute top-0 left-0 w-full h-1 flex">
                <div className="flex-1 bg-german-black" />
                <div className="flex-1 bg-german-red" />
                <div className="flex-1 bg-german-gold" />
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="w-full px-6 sm:px-10 lg:px-20 max-w-7xl mx-auto">
                  <AnimatePresence mode="wait">
                    {activeIndex === index && (
                      <motion.div
                        key={`content-${index}`}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="max-w-2xl"
                      >
                        {/* Badge */}
                        <motion.div custom={0} variants={textVariants}>
                          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-german-red/90 text-white text-sm font-semibold tracking-wide uppercase backdrop-blur-sm mb-6">
                            <span className="w-2 h-2 rounded-full bg-german-gold animate-pulse" />
                            MüllerFührerschein
                          </span>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                          custom={1}
                          variants={textVariants}
                          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 drop-shadow-lg"
                        >
                          {t(slide.titleKey)}
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                          custom={2}
                          variants={textVariants}
                          className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed mb-8 max-w-xl drop-shadow"
                        >
                          {t(slide.subtitleKey)}
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                          custom={3}
                          variants={textVariants}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <Link
                            to={user ? '/dashboard' : '/register'}
                            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-german-red to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-german-red transition-all duration-300 shadow-2xl shadow-red-900/30 hover:shadow-red-900/50 hover:scale-[1.03] text-base sm:text-lg"
                          >
                            {t(slide.ctaKey)}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                          <Link
                            to="/about"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/70 backdrop-blur-sm transition-all duration-300 text-base sm:text-lg"
                          >
                            {t('home.hero.learn_more')}
                          </Link>
                        </motion.div>

                        {/* Trust indicators */}
                        <motion.div
                          custom={4}
                          variants={textVariants}
                          className="mt-10 flex flex-wrap items-center gap-6 text-sm text-gray-300"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span>{t('heroCarousel.trust.legal')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-german-gold/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-german-gold" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span>{t('heroCarousel.trust.fast')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span>{t('heroCarousel.trust.secure')}</span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom navigation arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 hover:scale-110 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 hover:scale-110 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Custom pagination */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className="group relative flex items-center justify-center"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={activeIndex === index ? 'true' : 'false'}
          >
            <span
              className={`block rounded-full transition-all duration-500 ${
                activeIndex === index
                  ? 'w-10 h-3 bg-german-red shadow-lg shadow-red-500/40'
                  : 'w-3 h-3 bg-white/40 hover:bg-white/70'
              }`}
            />
            {activeIndex === index && (
              <motion.span
                layoutId="activeDot"
                className="absolute inset-0 rounded-full border-2 border-german-gold/60"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}

        {/* Pause/play button */}
        <button
          onClick={togglePause}
          className="ml-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
          aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
        >
          {isPaused ? (
            <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
            </svg>
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 z-20 bg-black/20">
        <div
          key={`progress-${activeIndex}`}
          className="h-full bg-gradient-to-r from-german-red via-german-gold to-german-red"
          style={{
            animation: 'heroProgress 6s linear forwards',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>

      <style>{`
        @keyframes heroProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  )
}
