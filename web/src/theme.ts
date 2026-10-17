import { alpha, createTheme } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

// Fonte única dos tokens: o MUI gera variáveis --mui-* que o index.css repassa ao Tailwind.

const ink = '#15171C';
const signal = '#C2410C';

const grey = {
  50: '#FAFAFB',
  100: '#F4F5F7',
  200: '#EBEDF0',
  300: '#DCDFE4',
  400: '#B9BEC7',
  500: '#8A8F99',
  600: '#5B606B',
  700: '#3F434B',
  800: '#26292F',
  900: ink,
};

const focusRing = {
  outline: `2px solid ${signal}`,
  outlineOffset: 2,
};

export const theme = createTheme(
  {
    cssVariables: true,
    palette: {
      mode: 'light',
      primary: {
        main: signal,
        dark: '#9A3412',
        light: '#FFF1EA',
        contrastText: '#FFFFFF',
      },
      success: { main: '#15803D', light: '#EAF6EE', contrastText: '#FFFFFF' },
      info: { main: '#3B5BA5', light: '#EDF1FA', contrastText: '#FFFFFF' },
      warning: { main: '#B45309', light: '#FDF3E7', contrastText: '#FFFFFF' },
      error: { main: '#B42339', light: '#FBEDEF', contrastText: '#FFFFFF' },
      grey,
      text: { primary: ink, secondary: '#686D78', disabled: grey[500] },
      background: { default: grey[100], paper: '#FFFFFF' },
      divider: grey[200],
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily:
        '"Geist Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      fontWeightMedium: 500,
      h1: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '1.0625rem',
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: '-0.01em',
      },
      h3: { fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.4 },
      subtitle1: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.4 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
      caption: { fontSize: '0.8125rem', lineHeight: 1.45 },
      button: {
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: 0,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        },
      },
      // O foco usa outline em vez do ripple.
      MuiButtonBase: {
        defaultProps: { disableRipple: true },
        styleOverrides: { root: { '&.Mui-focusVisible': focusRing } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            paddingInline: 14,
            minHeight: 36,
            transition:
              'background-color 150ms, border-color 150ms, color 150ms',
            '&:active:not(.Mui-disabled)': { transform: 'translateY(1px)' },
          },
          sizeLarge: {
            minHeight: 44,
            fontSize: '0.9375rem',
            paddingInline: 18,
          },
          sizeSmall: { minHeight: 30, paddingInline: 10 },
          outlined: {
            borderColor: grey[300],
            color: ink,
            '&:hover': { borderColor: grey[400], backgroundColor: grey[50] },
          },
          text: { '&:hover': { backgroundColor: grey[100] } },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            color: grey[600],
            transition: 'background-color 150ms, color 150ms',
            '&:hover': { backgroundColor: grey[200], color: ink },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: grey[300] },
            '&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline':
              {
                borderColor: grey[400],
              },
            // Borda escura no foco: a cor de destaque se confundiria com o estado de erro.
            '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
              borderColor: ink,
              borderWidth: 1.5,
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { marginInline: 2, fontSize: '0.8125rem' } },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: { '&.Mui-focused:not(.Mui-error)': { color: ink } },
        },
      },
      MuiLink: {
        defaultProps: { underline: 'hover' },
        styleOverrides: {
          root: {
            fontWeight: 500,
            color: '#9A3412',
            borderRadius: 2,
            '&.Mui-focusVisible, &:focus-visible': focusRing,
          },
        },
      },
      MuiPaper: { styleOverrides: { outlined: { borderColor: grey[200] } } },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            boxShadow: `0 24px 48px -12px ${alpha(ink, 0.25)}`,
          },
          paperFullScreen: { borderRadius: 0 },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            '&:not(.MuiBackdrop-invisible)': {
              backgroundColor: alpha(ink, 0.45),
            },
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: '1.0625rem',
            fontWeight: 600,
            padding: '20px 24px 8px',
            letterSpacing: '-0.01em',
          },
        },
      },
      MuiDialogContent: { styleOverrides: { root: { padding: '12px 24px' } } },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '12px 24px 20px',
            gap: 8,
            '& > :not(style) ~ :not(style)': { marginLeft: 0 },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 10,
            minWidth: 180,
            boxShadow: `0 12px 32px -8px ${alpha(ink, 0.22)}, 0 0 0 1px ${grey[200]}`,
          },
          list: { padding: 4 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontSize: '0.875rem',
            minHeight: 36,
            gap: 10,
            '& .MuiSvgIcon-root': { fontSize: '1.125rem' },
          },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: false, enterDelay: 400 },
        styleOverrides: {
          tooltip: {
            backgroundColor: ink,
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: 6,
            padding: '5px 8px',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 44 },
          indicator: { height: 2, backgroundColor: ink },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            minHeight: 44,
            minWidth: 0,
            paddingInline: 2,
            marginRight: 24,
            color: grey[600],
            '&:hover': { color: ink },
            '&.Mui-selected': { color: ink },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: grey[200],
            borderRadius: 8,
            padding: 3,
            gap: 2,
          },
          grouped: { border: 0, borderRadius: '6px !important', margin: 0 },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontSize: '0.8125rem',
            fontWeight: 500,
            lineHeight: 1.2,
            padding: '6px 12px',
            color: grey[600],
            '&:hover': { backgroundColor: alpha(ink, 0.04), color: ink },
            '&.Mui-selected, &.Mui-selected:hover': {
              backgroundColor: '#FFFFFF',
              color: ink,
              boxShadow: `0 1px 2px ${alpha(ink, 0.12)}`,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 500, height: 24 },
          label: { paddingInline: 8 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontSize: '0.875rem',
            alignItems: 'flex-start',
            // Fundos da paleta com texto escuro o bastante para contraste AA.
            variants: (
              [
                ['error', '#FBEDEF', '#8C1B2C', '#B42339'],
                ['success', '#EAF6EE', '#14532D', '#15803D'],
                ['info', '#EDF1FA', '#28407A', '#3B5BA5'],
                ['warning', '#FDF3E7', '#7C3A06', '#B45309'],
              ] as const
            ).map(([severity, backgroundColor, color, iconColor]) => ({
              props: { variant: 'standard', severity },
              style: {
                backgroundColor,
                color,
                '& .MuiAlert-icon': { color: iconColor },
              },
            })),
          },
          message: { paddingBlock: 9 },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: ink,
            borderRadius: 8,
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: { root: { borderRadius: 6, color: grey[400] } },
      },
      MuiSkeleton: {
        defaultProps: { animation: 'wave' },
        styleOverrides: { root: { backgroundColor: grey[200] } },
      },
    },
  },
  ptBR,
);
