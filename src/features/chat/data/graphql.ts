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