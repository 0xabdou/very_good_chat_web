import {gql} from "@apollo/client";

export const GET_NOTIFICATIONS_QUERY = gql`
    query GetNotifications {
        getNotifications {
            id
            date
            seen
            type
            friend {
                id
                username
                name
                photoURLSource
                photoURLMedium
                photoURLSmall
            }
        }
    }
`;

export const MARK_NOTIFICATION_AS_SEEN = gql`
    mutation MarkNotificationAsSeen($notificationID: Int!) {
        markNotificationAsSeen(notificationID: $notificationID)
    }
`;