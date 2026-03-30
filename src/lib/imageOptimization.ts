export const getOptimizedImageUrl = (url: string, width?: number, quality = 80): string => {
  if (!url) return '';

  if (url.includes('pexels.com')) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    params.append('auto', 'compress');
    params.append('cs', 'tinysrgb');
    return `${url}?${params.toString()}`;
  }

  if (url.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    params.append('quality', quality.toString());
    return `${url}?${params.toString()}`;
  }

  return url;
};

export const lazyLoadImage = (imageElement: HTMLImageElement) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.classList.add('loaded');
        }
        observer.unobserve(img);
      }
    });
  });

  observer.observe(imageElement);
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.map(url => preloadImage(url)));
};

export const generateResponsiveImageSrcSet = (url: string, widths: number[] = [400, 800, 1200, 1600]): string => {
  return widths
    .map(width => `${getOptimizedImageUrl(url, width)} ${width}w`)
    .join(', ');
};

export const generateImageSizes = (breakpoints: { [key: string]: string } = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
}): string => {
  return `
    (max-width: ${breakpoints.sm}) 100vw,
    (max-width: ${breakpoints.md}) 50vw,
    (max-width: ${breakpoints.lg}) 33vw,
    25vw
  `.trim();
};
