import {gql} from "@apollo/client";

export const GET_FRIENDSHIP_INFO_QUERY = gql`
    query GetFriendshipInfo($userID: String!) {
        getFriendshipInfo(userID: $userID) {
            user {
                id
                username
                name
                photoURL
            }
            friendship {
                status
                date
            }
        }
    }
`;

export const SEND_FRIEND_REQUEST_MUTATION = gql`
    mutation SendFriendRequest($userID: String!) {
        sendFriendRequest(userID: $userID) {
            date
            status
        }
    }
`;

export const ACCEPT_FRIEND_REQUEST_MUTATION = gql`
    mutation AcceptFriendRequest($userID: String!) {
        acceptFriendRequest(userID: $userID) {
            date
            status
        }
    }
`;

export const DECLINE_FRIEND_REQUEST_MUTATION = gql`
    mutation DeclineFriendRequest($userID: String!) {
        declineFriendRequest(userID: $userID) {
            date
            status
        }
    }
`;

export const CANCEL_FRIEND_REQUEST_MUTATION = gql`
    mutation CancelFriendRequest($userID: String!) {
        cancelFriendRequest(userID: $userID) {
            date
            status
        }
    }
`;

export const UNFRIEND_MUTATION = gql`
    mutation Unfriend($userID: String!) {
        unfriend(userID: $userID) {
            date
            status
        }
    }
`;