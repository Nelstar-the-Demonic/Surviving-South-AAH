import { View, Text, Pressable } from 'react-native';

interface InfoCardProps {
  title?: string;
  children: React.ReactNode;
  accent?: boolean;
  onPress?: () => void;
}

export function InfoCard({ title, children, accent = false, onPress }: InfoCardProps) {
  const content = (
    <View
      className="bg-card p-4 mb-3"
      style={{
        borderWidth: 1,
        borderColor: accent ? '#FFB81C' : '#222',
        borderLeftWidth: accent ? 3 : 1,
        borderLeftColor: accent ? '#FFB81C' : '#222',
      }}
    >
      {title ? (
        <Text className="text-primary font-bold text-sm mb-2 tracking-wider uppercase">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );

  if (onPress) return <Pressable onPress={onPress}>{content}</Pressable>;
  return content;
}
