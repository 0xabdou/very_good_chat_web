import {gql} from "@apollo/client";

export const ME_QUERY = gql`
    query MeQuery {
        me {
            user {
                id
                name
                username
                photoURLSource
                photoURLMedium
                photoURLSmall
            }
            activeStatus
        }
    }
`;

export const REGISTER_MUTATION = gql`
    mutation CreateMe($registerInput: UserCreation!) {
        register(input: $registerInput) {
            user {
                id
                name
                username
                photoURLSource
                photoURLMedium
                photoURLSmall
            }
            activeStatus
        }
    }
`;

export const UPDATE_USER_MUTATION = gql`
    mutation UpdateMe($updateUserInput: UserUpdate!) {
        updateUser(input: $updateUserInput) {
            user {
                id
                name
                username
                photoURLSource
                photoURLMedium
                photoURLSmall
            }
            activeStatus
        }
    }
`;

export const USERNAME_EXISTENCE_QUERY = gql`
    query UsernameExistenceQuery($username: String!) {
        checkUsernameExistence(username: $username)
    }
`;

export const FIND_USERS_QUERY = gql`
    query FindUsersQuery($findUsersSearchQuery: String!) {
        findUsers(searchQuery: $findUsersSearchQuery) {
            id
            name
            photoURLSource
            photoURLMedium
            photoURLSmall
            username
        }
    }
`;

export const UPDATE_ACTIVE_STATUS = gql`
    mutation UpdateActiveStatus($activeStatus: Boolean!) {
        updateActiveStatus(activeStatus: $activeStatus)
    }
`;

export const UPDATE_LAST_SEEN = gql`
    mutation UpdateLastSeen {
        updateLastSeen
    }
`;