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

export const SUBSCRIBE_TO_MESSAGE = gql`
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