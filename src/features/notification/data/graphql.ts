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