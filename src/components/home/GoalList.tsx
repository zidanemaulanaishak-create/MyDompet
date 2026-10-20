import { getThemeColors } from "@/constants/colors";
import { useTheme } from "@/context/theme-context";
import { useI18n } from "@/i18n";
import { GoalItem } from "@/data/dummyData";
import { Text, TouchableOpacity, View } from "react-native";
import { Iconify } from "react-native-iconify";
import EmptyState from "./EmptyState";
import { GoalCard } from "./GoalCard";

interface Props {
  title: string;
  items: GoalItem[];
  onSeeAll?: () => void;
  onPressItem?: (item: GoalItem) => void;
  onAdd?: () => void;
}

export default function GoalList({
  title,
  items,
  onSeeAll,
  onPressItem,
  onAdd,
}: Props) {
  const { isDark } = useTheme();
  const { t } = useI18n();
  const palette = getThemeColors(isDark ? "dark" : "light");
  return (
    <View className="rounded-2xl p-4 mb-6 shadow-sm" style={{ backgroundColor: palette.card }}>
      <TouchableOpacity
        className="flex-row justify-between items-center mb-4"
        onPress={onSeeAll}
      >
        <Text className="text-lg font-bold" style={{ color: palette.textDark }}>{title}</Text>
        <Iconify
          icon="ph:caret-right-bold"
          size={15}
          color={palette.textMuted}
        />
        
      </TouchableOpacity>
      <View className="h-[2px] mb-4 -mx-4" style={{ backgroundColor: palette.border }} />
      {items.length === 0 ? (
        <EmptyState
          icon="ph:target-bold"
          title={t('home.noGoals')}
          description={t('home.noGoalsDesc')}
          actionLabel={t('home.seeBudget')}
          onAction={onSeeAll}
        />
      ) : (
        items.map((g) => (
          <GoalCard key={g.id} item={g} onPress={onPressItem} />
        ))
      )}
    </View>
  );
}