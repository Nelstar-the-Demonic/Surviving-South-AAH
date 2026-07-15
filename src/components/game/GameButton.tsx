import { Pressable, Text, View } from 'react-native';

const C = {
  bg:          '#0A0A0F',
  gold:        '#F5C842',
  green:       '#4ADE80',
  red:         '#F87171',
  border:      '#2A2A3A',
  textPrimary: '#F1F0FF',
  textSub:     '#9B9BB8',
};

interface GameButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}

export function GameButton({
  label, onPress, variant = 'primary',
  disabled = false, fullWidth = true, size = 'md', icon,
}: GameButtonProps) {
  const bgColors = {
    primary:   disabled ? '#555' : C.gold,
    secondary: '#1A1A26',
    danger:    disabled ? '#555' : C.red,
    ghost:     'transparent',
  };
  const textColors = {
    primary:   C.bg,
    secondary: C.textPrimary,
    danger:    '#fff',
    ghost:     C.gold,
  };
  const paddings = { sm: 8, md: 12, lg: 16 };
  const fontSizes = { sm: 13, md: 15, lg: 16 };
  const borderStyle = variant === 'secondary'
    ? { borderWidth: 1, borderColor: C.border }
    : variant === 'ghost'
    ? { borderWidth: 1, borderColor: C.gold }
    : {};

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={{
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: paddings[size], paddingHorizontal: paddings[size] + 8,
        width: fullWidth ? '100%' : undefined,
        backgroundColor: bgColors[variant],
        opacity: disabled ? 0.55 : 1,
        borderRadius: 8,
        ...borderStyle,
      }}
    >
      <Text style={{ color: textColors[variant], fontWeight: '800', fontSize: fontSizes[size], letterSpacing: 0.4 }}>
        {icon ? `${icon}  ` : ''}{label}
      </Text>
    </Pressable>
  );
}
