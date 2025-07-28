export const designTokens = {
  colors: {
    primary: {
      orange: { 50: '#fff7ed', 100: '#ffedd5', 500: '#f97316', 600: '#ea580c', 900: '#9a3412' },
      blue: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 900: '#1e3a8a' },
      green: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 900: '#14532d' }
    },
    neutral: {
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
      400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
      800: '#1e293b', 900: '#0f172a'
    },
    semantic: {
      success: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      warning: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      error: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' },
      info: { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' }
    }
  },
  spacing: {
    xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem'
  },
  typography: {
    fontSizes: {
      xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
      xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem'
    },
    fontWeights: { normal: '400', medium: '500', semibold: '600', bold: '700' }
  },
  borderRadius: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', '2xl': '1.5rem' },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
}

export function getDesignToken(path: string): unknown {
  return path.split('.').reduce((obj: Record<string, unknown> | undefined, key: string): Record<string, unknown> | undefined => {
    if (obj && typeof obj === 'object' && key in obj) {
      const value = obj[key]
      if (value && typeof value === 'object') {
        return value as Record<string, unknown>
      }
      return { [key]: value } as Record<string, unknown>
    }
    return undefined
  }, designTokens as Record<string, unknown>)
}

export const componentVariants = {
  button: {
    primary: 'btn-modern bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-elegant hover:shadow-glow-orange',
    secondary: 'btn-modern glass-morphism hover:bg-white/80 text-slate-800 shadow-elegant',
    outline: 'btn-modern border-2 border-orange-500 text-orange-500 hover:glass-morphism hover:shadow-elegant',
    ghost: 'btn-modern text-slate-700 hover:glass-morphism hover:shadow-elegant'
  },
  card: {
    default: 'glass-morphism rounded-2xl shadow-elegant border border-white/20',
    elevated: 'glass-morphism rounded-2xl shadow-floating border border-white/20',
    interactive: 'card-modern glass-morphism rounded-2xl shadow-elegant border border-white/20 hover:shadow-floating'
  },
  input: {
    default: 'glass-morphism border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:shadow-glow-orange transition-all duration-300',
    error: 'glass-morphism border border-red-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 transition-all duration-300'
  }
}
