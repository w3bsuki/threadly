'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import type { ImageProps } from 'next/image';

const NextImage = dynamic(() => import('next/image'), {
  ssr: true,
  loading: () => <div className="animate-pulse bg-accent w-full h-full rounded" />,
});

interface OptimizedImageProps extends ImageProps {
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({ 
  lazy = true, 
  placeholder = 'empty',
  ...props 
}: OptimizedImageProps) {
  const [isIntersecting, setIsIntersecting] = useState(!lazy);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    const element = document.querySelector(`[data-image-src="${props.src}"]`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [lazy, props.src]);

  if (!isIntersecting) {
    return (
      <div 
        data-image-src={props.src}
        className={`animate-pulse bg-accent rounded ${props.className || ''}`}
        style={{
          width: props.width || '100%',
          height: props.height || '100%',
        }}
      />
    );
  }

  return (
    <NextImage
      {...props}
      placeholder={placeholder}
      loading={lazy ? 'lazy' : 'eager'}
      quality={props.quality || 75}
      sizes={props.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
    />
  );
}