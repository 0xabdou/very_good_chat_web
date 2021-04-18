import {gql} from "@apollo/client";

export const GET_CONVERSATIONS = gql`
    query GetConversations {
        getConversations {
            id
            participants {
                id
                username
                name
                photoURLSource
                photoURLMedium
                photoURLSmall
            }
            messages {
                id
                conversationID
                senderID
                text
                medias {
                    url
                    thumbUrl
                    type
                }
                sentAt
                deliveredTo {
                    userID
                    date
                }
                seenBy {
                    userID
                    date
                }
            }
            type
            canChat
        }
    }
`;

export const GET_OR_CREATE_OTO_CONVERSATION = gql`
    mutation GetOrCreateOTOConversation($userID: String!) {
        getOrCreateOneToOneConversation(userID: $userID) {
            id
            participants {
                id
                username
                name
                photoURLSource
                photoURLMedium
                photoURLSmall
            }
            messages {
                id
                conversationID
                senderID
                text
                medias {
                    url
                    thumbUrl
                    type
                }
                sentAt
                deliveredTo {
                    userID
                    date
                }
                seenBy {
                    userID
                    date
                }
            }
            type
            canChat
        }
    }
`;

export const SEND_MESSAGE = gql`
    mutation SendMessage($message: SendMessageInput!) {
        sendMessage(message: $message) {
            id
            conversationID
            senderID
            text
            medias {
                url
                thumbUrl
                type
            }
            sentAt
            deliveredTo {
                userID
                date
            }
            seenBy {
                userID
                date
            }
        }
    }
`;

export const MESSAGES_DELIVERED = gql`
    mutation MessagesDelivered($conversationIDs: [Int!]!) {
        messagesDelivered(conversationIDs: $conversationIDs)
    }
`;

export const MESSAGES_SEEN = gql`
    mutation MessagesSeen($conversationID: Int!) {
        messagesSeen(conversationID: $conversationID)
    }
`;

export const SUBSCRIBE_TO_MESSAGES = gql`
    subscription SubscribeToMessages {
        messages{
            message {
                id
                conversationID
                senderID
                text
                medias {
                    url
                    thumbUrl
                    type
                }
                sentAt
                deliveredTo {
                    userID
                    date
                }
                seenBy {
                    userID
                    date
                }
            }
            update
        }
    }
`;

export const SUBSCRIBE_TO_TYPINGS = gql`
    subscription SubscribeToTypings {
        typings {
            conversationID
            userID
            started
        }
    }
`;

export const TYPING = gql`
    mutation ImTyping($conversationID: Int!, $started: Boolean!) {
        typing(typing: {conversationID: $conversationID, started: $started}) {
            conversationID,
        }
    }
`;

export const GET_MORE_MESSAGES = gql`
    query GetMoreMessages($conversationID: Int!, $messageID: Int!) {
        getMoreMessages(conversationID: $conversationID, messageID: $messageID){
            id
            conversationID
            senderID
            text
            medias {
                url
                thumbUrl
                type
            }
            sentAt
            deliveredTo {
                userID
                date
            }
            seenBy {
                userID
                date
            }
        }
    }
`;