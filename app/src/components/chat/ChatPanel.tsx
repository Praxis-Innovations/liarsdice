import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMultiplayerStore } from "../../store/multiplayerStore";
import type { ChatMessage } from "../../store/multiplayerStore";
import { useTheme } from "../../theme/ThemeProvider";

// ─── Single message bubble ────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const { colors, spacing, typography } = useTheme();
  const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={{
        alignSelf: msg.isMe ? "flex-end" : "flex-start",
        maxWidth: "80%",
        marginBottom: spacing.xs,
      }}
    >
      {!msg.isMe && (
        <Text
          style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: 11,
            color: colors.textSecondary,
            marginBottom: 2,
            marginLeft: 4,
          }}
        >
          {msg.username}
        </Text>
      )}
      <View
        style={{
          backgroundColor: msg.isMe ? colors.primary : colors.surface,
          borderRadius: 14,
          borderBottomRightRadius: msg.isMe ? 4 : 14,
          borderBottomLeftRadius: msg.isMe ? 14 : 4,
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
        }}
      >
        <Text
          style={{
            fontFamily: typography.body.fontFamily,
            fontSize: 14,
            color: msg.isMe ? "#ffffff" : colors.textPrimary,
          }}
        >
          {msg.text}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: typography.caption.fontFamily,
          fontSize: 10,
          color: colors.textSecondary,
          marginTop: 2,
          alignSelf: msg.isMe ? "flex-end" : "flex-start",
          marginRight: msg.isMe ? 4 : 0,
          marginLeft: msg.isMe ? 0 : 4,
        }}
      >
        {timeStr}
      </Text>
    </View>
  );
}

// ─── ChatPanel ───────────────────────────────────────────────────────────────

interface ChatPanelProps {
  channelTarget?: string;
  channelType?: number;
  placeholder?: string;
  maxHeight?: number;
}

export function ChatPanel({
  channelTarget,
  channelType = 1,
  placeholder = "Send a message…",
  maxHeight = 300,
}: ChatPanelProps) {
  const { colors, spacing, typography } = useTheme();
  const { chatMessages, chatChannelId, joinChannel, sendChatMessage } = useMultiplayerStore();
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Join the channel if a target is specified and we're not already in it.
  // Clean up on unmount so the next screen can join a different channel.
  useEffect(() => {
    if (!channelTarget) return;
    void joinChannel(channelTarget, channelType);
    return () => {
      // leaveChannel is read from store at cleanup time via closure.
      useMultiplayerStore.getState().leaveChannel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelTarget]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    if (chatMessages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatMessages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendChatMessage(trimmed);
    setText("");
  };

  const isJoined = !!chatChannelId;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ maxHeight }}
    >
      <View
        style={{
          backgroundColor: colors.surfaceRaised,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          flex: 1,
        }}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.sm, paddingBottom: spacing.xs }}
          style={{ flex: 1 }}
          ListEmptyComponent={
            <Text
              style={{
                fontFamily: typography.caption.fontFamily,
                fontSize: 12,
                color: colors.textSecondary,
                textAlign: "center",
                paddingVertical: spacing.sm,
              }}
            >
              {isJoined ? "No messages yet — say hello!" : "Joining chat…"}
            </Text>
          }
          renderItem={({ item }) => <MessageBubble msg={item} />}
        />

        {/* Input row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.xs,
            padding: spacing.xs,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            editable={isJoined}
            style={{
              flex: 1,
              fontFamily: typography.body.fontFamily,
              fontSize: 14,
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderRadius: 18,
              paddingHorizontal: spacing.sm,
              paddingVertical: 7,
            }}
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || !isJoined}
            style={{
              backgroundColor: !text.trim() || !isJoined ? colors.border : colors.primary,
              borderRadius: 18,
              paddingHorizontal: spacing.md,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontFamily: typography.bodyMedium.fontFamily,
                fontSize: 13,
                color: "#ffffff",
              }}
            >
              Send
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
