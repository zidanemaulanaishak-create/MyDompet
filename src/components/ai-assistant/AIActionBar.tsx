import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';

interface Props {
  messageId: string;
  likeStatus: 'none' | 'up' | 'down';
  onLike: (messageId: string, value: 'up' | 'down') => void;
  onCopy: (messageId: string) => void;
  onShare: (messageId: string) => void;
  onMore: (messageId: string) => void;
}

type ActionType = 'copy' | 'like' | 'dislike' | 'share' | 'more';

const ACTIONS: readonly { icon: string; label: string; action: ActionType }[] = [
  { icon: 'ph:copy-bold', label: 'ai.action.copy', action: 'copy' },
  { icon: 'ph:thumbs-up-bold', label: 'ai.action.like', action: 'like' },
  { icon: 'ph:thumbs-down-bold', label: 'ai.action.dislike', action: 'dislike' },
  { icon: 'ph:share-network-bold', label: 'ai.action.share', action: 'share' },
  { icon: 'ph:dots-three-bold', label: 'ai.action.more', action: 'more' },
];

export default function AIActionBar({
  messageId,
  likeStatus,
  onLike,
  onCopy,
  onShare,
  onMore,
}: Props) {
  const handlePress = (action: ActionType) => {
    switch (action) {
      case 'copy':
        onCopy(messageId);
        break;
      case 'like':
        onLike(messageId, 'up');
        break;
      case 'dislike':
        onLike(messageId, 'down');
        break;
      case 'share':
        onShare(messageId);
        break;
      case 'more':
        onMore(messageId);
        break;
    }
  };

  const getActionColor = (action: ActionType) => {
    if (action === 'like' && likeStatus === 'up') return '#FDE68A';
    if (action === 'dislike' && likeStatus === 'down') return '#FCA5A5';
    return '#94A3B8';
  };

  const getActionBackground = (action: ActionType) => {
    if (action === 'like' && likeStatus === 'up') return 'rgba(253,230,138,0.14)';
    if (action === 'dislike' && likeStatus === 'down') return 'rgba(252,165,165,0.14)';
    return 'transparent';
  };

  return (
    <View style={styles.container}>
      {ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.action}
          style={[styles.actionBtn, { backgroundColor: getActionBackground(action.action) }]}
          onPress={() => handlePress(action.action)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Iconify
            icon={action.icon}
            size={18}
            color={getActionColor(action.action)}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
    paddingTop: 4,
    paddingBottom: 2,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});