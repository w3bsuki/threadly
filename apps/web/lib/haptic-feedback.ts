'use client';

type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

interface HapticFeedbackOptions {
  pattern?: number[];
  duration?: number;
}

class HapticFeedback {
  private isSupported: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isSupported = 'vibrate' in navigator;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isHapticSupported(): boolean {
    return this.isSupported;
  }

  public light(): void {
    this.trigger('light');
  }

  public medium(): void {
    this.trigger('medium');
  }

  public heavy(): void {
    this.trigger('heavy');
  }

  public selection(): void {
    this.trigger('selection');
  }

  public success(): void {
    this.trigger('success');
  }

  public warning(): void {
    this.trigger('warning');
  }

  public error(): void {
    this.trigger('error');
  }

  public impact(intensity: 'light' | 'medium' | 'heavy' = 'medium'): void {
    this.trigger(intensity);
  }

  private trigger(type: HapticFeedbackType, options?: HapticFeedbackOptions): void {
    if (!this.isEnabled || !this.isSupported) return;

    const patterns = {
      light: [50],
      medium: [100],
      heavy: [200],
      selection: [25],
      success: [50, 50, 50],
      warning: [100, 100],
      error: [200, 100, 200]
    };

    const pattern = options?.pattern || patterns[type];
    
    try {
      if (pattern.length === 1) {
        navigator.vibrate(pattern[0]);
      } else {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  public custom(pattern: number[]): void {
    if (!this.isEnabled || !this.isSupported) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Custom haptic feedback failed:', error);
    }
  }
}

export const hapticFeedback = new HapticFeedback();

export function useHapticFeedback() {
  return {
    light: () => hapticFeedback.light(),
    medium: () => hapticFeedback.medium(),
    heavy: () => hapticFeedback.heavy(),
    selection: () => hapticFeedback.selection(),
    success: () => hapticFeedback.success(),
    warning: () => hapticFeedback.warning(),
    error: () => hapticFeedback.error(),
    impact: (intensity: 'light' | 'medium' | 'heavy' = 'medium') => hapticFeedback.impact(intensity),
    custom: (pattern: number[]) => hapticFeedback.custom(pattern),
    isSupported: hapticFeedback.isHapticSupported(),
    setEnabled: (enabled: boolean) => hapticFeedback.setEnabled(enabled)
  };
}