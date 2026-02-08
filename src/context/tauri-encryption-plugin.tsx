import type { PluginListenerHandle } from '@capacitor/core';
import { invoke } from '@tauri-apps/api/core';
import type {
  BGroupInfo,
  BGroupMessage,
  BUserMessage,
  Conversation,
  EncryptionPluginType,
  UpdateRoleProposal,
  UpdateUserProposal
} from './encryption-plugin';

export class TauriEncryptionPlugin implements EncryptionPluginType {
  addListener(eventName: string, listenerFunc: (...args: any[]) => any): Promise<PluginListenerHandle> {
    throw new Error('Method not implemented.');
  }
  removeAllListeners(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async encryptAndSend(options: {
    textB64: string;
    to: string;
  }): Promise<BUserMessage> {
    return await invoke('encrypt_and_send', {
      textB64: options.textB64,
      to: options.to,
    });
  }

  async getLastMessages(options: {
    other: string;
    limit: number;
    before: number;
  }): Promise<{ result: BUserMessage[] }> {
    return await invoke('get_last_messages', {
      other: options.other,
      limit: options.limit,
      before: options.before,
    });
  }

  async getLastMessagesFromAllConversations(): Promise<{ result: { message: BUserMessage; count: number }[] }> {
    return await invoke('get_last_messages_from_all_conversations');
  }

  async saveTokens(options: {
    accessToken: string;
    refreshToken: string;
  }): Promise<void> {
    return await invoke('save_tokens', {
      accessToken: options.accessToken,
      refreshToken: options.refreshToken,
    });
  }

  async markAsReadUntil(options: { username: string; ts: number }): Promise<void> {
    return await invoke('mark_as_read_until', {
      username: options.username,
      ts: options.ts,
    });
  }

  async showUserNotification(options: BUserMessage): Promise<void> {
    return await invoke('show_user_notification', { message: options });
  }

  async showCallNotification(options: {
    caller: string;
    sessionId: number;
    conversationId: number;
  }): Promise<void> {
    return await invoke('show_call_notification', {
      caller: options.caller,
      sessionId: options.sessionId,
      conversationId: options.conversationId,
    });
  }

  async requestAllPermissions(options: { permissions: string[] }): Promise<any> {
    return await invoke('request_all_permissions', {
      permissions: options.permissions,
    });
  }

  async handleMessage(msg: BUserMessage): Promise<void> {
    return await invoke('handle_message', { message: msg });
  }

  async getFileServerUrl(): Promise<{ url: string; token: string }> {
    return await invoke('get_file_server_url');
  }

  async getLastGroupMessages(): Promise<{ result: BGroupMessage[] }> {
    return await invoke('get_last_group_messages');
  }

  async encryptAndSendGroupMessage(options: {
    textB64: string;
    groupId: number;
  }): Promise<{ messageId: number }> {
    return await invoke('encrypt_and_send_group_message', {
      textB64: options.textB64,
      groupId: options.groupId,
    });
  }

  async getGroupExtension(options: { groupId: number }): Promise<{ resultB64: string }> {
    return await invoke('get_group_extension', { groupId: options.groupId });
  }

  async createGroup(options: { groupName: string }): Promise<BGroupInfo> {
    return await invoke('create_group', { groupName: options.groupName });
  }

  async getGroupInfos(): Promise<{ result: BGroupInfo[] }> {
    return await invoke('get_group_infos');
  }

  async getGroupInfoAndExtension(options: { groupId: number }): Promise<BGroupInfo & { extensionB64: string }> {
    return await invoke('get_group_info_and_extension', { groupId: options.groupId });
  }

  async getGroupMessages(options: {
    groupId: number;
    startBefore: number;
    limit: number;
  }): Promise<{ result: BGroupMessage[] }> {
    return await invoke('get_group_messages', {
      groupId: options.groupId,
      startBefore: options.startBefore,
      limit: options.limit,
    });
  }

  async updateGroupChannel(options: {
    groupId: number;
    id: number;
    delete: boolean;
    name: string;
    channelTy: number;
    defaultPermissions: number;
  }): Promise<{ messageId: number }> {
    return await invoke('update_group_channel', {
      groupId: options.groupId,
      id: options.id,
      delete: options.delete,
      name: options.name,
      channelTy: options.channelTy,
      defaultPermissions: options.defaultPermissions,
    });
  }

  async updateGroupRoles(options: {
    groupId: number;
    roles: UpdateRoleProposal[];
  }): Promise<{ messageId: number }> {
    return await invoke('update_group_roles', {
      groupId: options.groupId,
      roles: options.roles,
    });
  }

  async updateGroupRolesInChannel(options: {
    groupId: number;
    channelId: number;
    roles: UpdateRoleProposal[];
  }): Promise<{ messageId: number }> {
    return await invoke('update_group_roles_in_channel', {
      groupId: options.groupId,
      channelId: options.channelId,
      roles: options.roles,
    });
  }

  async updateGroupUsers(options: {
    groupId: number;
    users: UpdateUserProposal[];
  }): Promise<{ messageId: number }> {
    return await invoke('update_group_users', {
      groupId: options.groupId,
      users: options.users,
    });
  }

  async getConversations(options: { token: string }): Promise<{ result: Conversation[] }> {
    return await invoke('get_conversations', { token: options.token });
  }

  async dispose(): Promise<void> {
    return await invoke('dispose');
  }

  async testMethod(options: { [key: string]: any }): Promise<{ [key: string]: any }> {
    return await invoke('test_method', { data: options });
  }

  async clearNotifications(): Promise<void> {
    return await invoke('clear_notifications');
  }

  async addGroupMember(options: { groupId: number; username: string; roleId: number }): Promise<void> {
    return await invoke('add_group_member', {
      groupId: options.groupId,
      username: options.username,
      roleId: options.roleId,
    });
  }

  async kickGroupMember(options: { groupId: number; username: string }): Promise<void> {
    return await invoke('kick_group_member', {
      groupId: options.groupId,
      username: options.username,
    });
  }
}

// Create instance for Tauri environment
export const TauriEncryptionPluginInstance = new TauriEncryptionPlugin();