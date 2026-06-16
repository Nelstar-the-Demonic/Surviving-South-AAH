import { Pressable, Text, View } from 'react-native';

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
    primary: disabled ? '#555' : '#FFB81C',
    secondary: '#1A1A1A',
    danger: disabled ? '#555' : '#E32636',
    ghost: 'transparent',
  };
  const textColors = {
    primary: '#0D0D0D',
    secondary: '#E8E4D8',
    danger: '#fff',
    ghost: '#FFB81C',
  };
  const paddings = { sm: 'py-2 px-3', md: 'py-3 px-4', lg: 'py-4 px-6' };
  const fontSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
  const borderStyle = variant === 'secondary' ? { borderWidth: 1, borderColor: '#333' }
    : variant === 'ghost' ? { borderWidth: 1, borderColor: '#FFB81C' } : {};

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      className={`items-center justify-center ${paddings[size]} ${fullWidth ? 'w-full' : ''}`}
      style={{ backgroundColor: bgColors[variant], opacity: disabled ? 0.6 : 1, ...borderStyle }}
    >
      <Text
        className={`font-bold ${fontSizes[size]} tracking-wide`}
        style={{ color: textColors[variant] }}
      >
        {icon ? `${icon}  ` : ''}{label}
      </Text>
    </Pressable>
  );
}
