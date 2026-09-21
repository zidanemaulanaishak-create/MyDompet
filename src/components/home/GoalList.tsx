import { COLORS } from "@/constants/colors";
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
  return (
    <View className="bg-card rounded-2xl p-4 mb-6 shadow-sm">
      <TouchableOpacity
        className="flex-row justify-between items-center mb-4"
        onPress={onSeeAll}
      >
        <Text className="text-lg font-bold text-textDark">{title}</Text>
        <Iconify
          icon="ph:caret-right-bold"
          size={15}
          color={COLORS.textMuted}
        />
        
      </TouchableOpacity>
      <View className="h-[2px] bg-[#D9D9D9] mb-4 -mx-4" />
      {items.length === 0 ? (
        <EmptyState
          icon="ph:target-bold"
          title="Belum ada target"
          description="Buat target finansial pertamamu agar tetap fokus menabung."
          actionLabel="Lihat Budget"
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