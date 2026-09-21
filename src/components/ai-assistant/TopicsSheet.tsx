import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { POPULAR_TOPICS, PopularTopic } from './AiHero';

interface Props {
  visible: boolean;
  onClose: () => void;
  onTopicPress: (topic: PopularTopic) => void;
}

export default function TopicsSheet({ visible, onClose, onTopicPress }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismiss} activeOpacity={1} onPress={onClose} accessibilityLabel="Tutup" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <Text style={styles.title}>Semua Topik</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn} accessibilityLabel="Tutup daftar topik">
              <Iconify icon="ph:x-bold" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {POPULAR_TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.item}
                activeOpacity={0.75}
                onPress={() => {
                  onTopicPress(topic);
                  onClose();
                }}
              >
                <View style={styles.itemIcon}>
                  <Iconify icon={topic.icon} size={17} color="#FFFFFF" />
                </View>
                <Text style={styles.itemLabel} numberOfLines={2}>{topic.label}</Text>
                <Iconify icon="ph:arrow-up-right-bold" size={15} color="#64748B" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2,6,23,0.6)' },
  dismiss: { flex: 1 },
  sheet: { maxHeight: '72%', backgroundColor: '#0F1D4A', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 20, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 18 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'center', marginBottom: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)' },
  list: { gap: 10, paddingBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12 },
  itemIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563EB' },
  itemLabel: { flex: 1, color: '#F1F5F9', fontSize: 17, fontWeight: '700', lineHeight: 18 },
});
