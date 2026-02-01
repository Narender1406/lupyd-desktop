use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Runtime};

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateRoleProposal {
    name: String,
    #[serde(rename = "roleId")]
    role_id: i32,
    permissions: i32,
    delete: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserProposal {
    username: String,
    #[serde(rename = "roleId")]
    role_id: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Conversation {
    other: String,
    settings: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BUserMessage {
    id: i32,
    other: String,
    #[serde(rename = "sentByOther")]
    sent_by_other: bool,
    #[serde(rename = "textB64")]
    text_b64: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BGroupMessage {
    sender: String,
    #[serde(rename = "groupId")]
    group_id: i32,
    #[serde(rename = "textB64")]
    text_b64: String,
    id: i32,
    #[serde(rename = "channelId")]
    channel_id: i32,
    epoch: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BGroupInfo {
    name: String,
    #[serde(rename = "groupId")]
    group_id: i32,
    description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileServerResponse {
    url: String,
    token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageIdResponse {
    #[serde(rename = "messageId")]
    message_id: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupExtensionResponse {
    #[serde(rename = "resultB64")]
    result_b64: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupInfoAndExtension {
    name: String,
    #[serde(rename = "groupId")]
    group_id: i32,
    description: String,
    #[serde(rename = "extensionB64")]
    extension_b64: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LastMessagesResponse {
    result: Vec<BUserMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LastGroupMessagesResponse {
    result: Vec<BGroupMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversationWithCount {
    message: BUserMessage,
    count: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AllConversationsResponse {
    result: Vec<ConversationWithCount>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupInfosResponse {
    result: Vec<BGroupInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversationsResponse {
    result: Vec<Conversation>,
}

#[command]
pub async fn encrypt_and_send<R: Runtime>(
    _app: AppHandle<R>,
    text_b64: String,
    to: String,
) -> Result<BUserMessage, String> {
    // TODO: Implement encryption and sending logic
    Ok(BUserMessage {
        id: 1,
        other: to,
        sent_by_other: false,
        text_b64,
    })
}

#[command]
pub async fn get_last_messages<R: Runtime>(
    _app: AppHandle<R>,
    other: String,
    limit: i32,
    before: i32,
) -> Result<LastMessagesResponse, String> {
    // TODO: Implement message retrieval logic
    Ok(LastMessagesResponse { result: vec![] })
}

#[command]
pub async fn get_last_messages_from_all_conversations<R: Runtime>(
    _app: AppHandle<R>,
) -> Result<AllConversationsResponse, String> {
    // TODO: Implement logic to get last messages from all conversations
    Ok(AllConversationsResponse { result: vec![] })
}

#[command]
pub async fn save_tokens<R: Runtime>(
    _app: AppHandle<R>,
    access_token: String,
    refresh_token: String,
) -> Result<(), String> {
    // TODO: Implement token saving logic
    Ok(())
}

#[command]
pub async fn mark_as_read_until<R: Runtime>(
    _app: AppHandle<R>,
    username: String,
    ts: i64,
) -> Result<(), String> {
    // TODO: Implement mark as read logic
    Ok(())
}

#[command]
pub async fn show_user_notification<R: Runtime>(
    _app: AppHandle<R>,
    message: BUserMessage,
) -> Result<(), String> {
    // TODO: Implement notification display logic
    Ok(())
}

#[command]
pub async fn show_call_notification<R: Runtime>(
    _app: AppHandle<R>,
    caller: String,
    session_id: i32,
    conversation_id: i32,
) -> Result<(), String> {
    // TODO: Implement call notification logic
    Ok(())
}

#[command]
pub async fn request_all_permissions<R: Runtime>(
    _app: AppHandle<R>,
    permissions: Vec<String>,
) -> Result<serde_json::Value, String> {
    // TODO: Implement permission request logic
    Ok(serde_json::json!({}))
}

#[command]
pub async fn handle_message<R: Runtime>(
    _app: AppHandle<R>,
    message: BUserMessage,
) -> Result<(), String> {
    // TODO: Implement message handling logic
    Ok(())
}

#[command]
pub async fn get_file_server_url<R: Runtime>(
    _app: AppHandle<R>,
) -> Result<FileServerResponse, String> {
    // TODO: Implement file server URL retrieval
    Ok(FileServerResponse {
        url: "http://localhost:8080".to_string(),
        token: "dummy_token".to_string(),
    })
}

#[command]
pub async fn get_last_group_messages<R: Runtime>(
    _app: AppHandle<R>,
) -> Result<LastGroupMessagesResponse, String> {
    // TODO: Implement group message retrieval
    Ok(LastGroupMessagesResponse { result: vec![] })
}

#[command]
pub async fn encrypt_and_send_group_message<R: Runtime>(
    _app: AppHandle<R>,
    message: BGroupMessage,
) -> Result<MessageIdResponse, String> {
    // TODO: Implement group message encryption and sending
    Ok(MessageIdResponse { message_id: 1 })
}

#[command]
pub async fn get_group_extension<R: Runtime>(
    _app: AppHandle<R>,
    group_id: i32,
) -> Result<GroupExtensionResponse, String> {
    // TODO: Implement group extension retrieval
    Ok(GroupExtensionResponse {
        result_b64: "".to_string(),
    })
}

#[command]
pub async fn create_group<R: Runtime>(
    _app: AppHandle<R>,
    group_name: String,
) -> Result<BGroupInfo, String> {
    // TODO: Implement group creation logic
    Ok(BGroupInfo {
        name: group_name,
        group_id: 1,
        description: "".to_string(),
    })
}

#[command]
pub async fn get_group_infos<R: Runtime>(
    _app: AppHandle<R>,
) -> Result<GroupInfosResponse, String> {
    // TODO: Implement group infos retrieval
    Ok(GroupInfosResponse { result: vec![] })
}

#[command]
pub async fn get_group_info_and_extension<R: Runtime>(
    _app: AppHandle<R>,
    group_id: i32,
) -> Result<GroupInfoAndExtension, String> {
    // TODO: Implement group info and extension retrieval
    Ok(GroupInfoAndExtension {
        name: "".to_string(),
        group_id,
        description: "".to_string(),
        extension_b64: "".to_string(),
    })
}

#[command]
pub async fn get_group_messages<R: Runtime>(
    _app: AppHandle<R>,
    group_id: i32,
    start_before: i32,
    limit: i32,
) -> Result<LastGroupMessagesResponse, String> {
    // TODO: Implement group message retrieval with pagination
    Ok(LastGroupMessagesResponse { result: vec![] })
}

#[command]
pub async fn update_group_channel<R: Runtime>(
    _app: AppHandle<R>,
    group_id: i32,
    id: i32,
    delete: bool,
    name: String,
    channel_ty: i32,
    default_permissions: i32,
) -> Result<MessageIdResponse, String> {
    // TODO: Implement group channel update logic
    Ok(MessageIdResponse { message_id: 1 })
}

#[command]
pub async fn update_group_roles<R: Runtime>(
    _app: AppHandle<R>,
    group_id: i32,
    roles: Vec<UpdateRoleProposal>,
) -> Result<MessageIdResponse, String> {
    // TODO: Implement group roles update logic
    Ok(MessageIdResponse { message_id: 1 })
}

#[command]
pub async fn update_group_roles_in_channel<R: Runtime>(
    _app: AppHandle<R>,
    group_id: i32,
    channel_id: i32,
    roles: Vec<UpdateRoleProposal>,
) -> Result<MessageIdResponse, String> {
    // TODO: Implement group roles in channel update logic
    Ok(MessageIdResponse { message_id: 1 })
}

#[command]
pub async fn update_group_users<R: Runtime>(
    _app: AppHandle<R>,
    group_id: i32,
    users: Vec<UpdateUserProposal>,
) -> Result<MessageIdResponse, String> {
    // TODO: Implement group users update logic
    Ok(MessageIdResponse { message_id: 1 })
}

#[command]
pub async fn get_conversations<R: Runtime>(
    _app: AppHandle<R>,
    token: String,
) -> Result<ConversationsResponse, String> {
    // TODO: Implement conversations retrieval
    Ok(ConversationsResponse { result: vec![] })
}

#[command]
pub async fn dispose<R: Runtime>(_app: AppHandle<R>) -> Result<(), String> {
    // TODO: Implement cleanup logic
    Ok(())
}