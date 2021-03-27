import {gql} from "@apollo/client";

export const BLOCK = gql`
    mutation BlockMutation($blockedID: String!) {
        block(blocked_id: $blockedID) {
            user {
                id
                username
                name
                photoURLSource
                photoURLMedium
                photoURLSmall
            }
            date
        }
    }
`;

export const UNBLOCK = gql`
    mutation Unblock($blockedID: String!) {
        unblock(blocked_id: $blockedID)
    }
`;

export const GET_BLOCKED_USERS = gql`
    query GetBlockedUsers {
        getBlockedUsers {
            user {
                id
                username
                name
                photoURLSource
                photoURLMedium
                photoURLSmall
            }
            date
        }
    }
`;