import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function InboxScreen() {
  const mockConversations = [
    {
      id: '1',
      name: 'John Doe',
      lastMessage: 'Hey! How are you?',
      platform: 'instagram',
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'Jane Smith',
      lastMessage: 'Thanks for sharing!',
      platform: 'tiktok',
      unreadCount: 0,
    },
  ];

  const renderConversation = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.conversation}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.details}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        <Text style={styles.platform}>{item.platform}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  list: {
    padding: 16,
  },
  conversation: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  platform: {
    color: '#666',
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
