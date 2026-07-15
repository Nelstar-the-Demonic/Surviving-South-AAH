import { View, Text, Pressable } from 'react-native';

const C = {
  surface: '#13131A',
  gold:    '#F5C842',
  border:  '#2A2A3A',
  textPrimary: '#F1F0FF',
};

interface InfoCardProps {
  title?: string;
  children: React.ReactNode;
  accent?: boolean;
  onPress?: () => void;
}

export function InfoCard({ title, children, accent = false, onPress }: InfoCardProps) {
  const content = (
    <View
      style={{
        backgroundColor: C.surface,
        padding: 14,
        marginBottom: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: accent ? C.gold : C.border,
        borderTopWidth: accent ? 3 : 1,
        borderTopColor: accent ? C.gold : C.border,
      }}
    >
      {title ? (
        <Text style={{ color: C.gold, fontWeight: '800', fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );

  if (onPress) return <Pressable onPress={onPress}>{content}</Pressable>;
  return content;
}
