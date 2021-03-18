import {gql} from "@apollo/client";

export const ME_QUERY = gql`
    query MeQuery {
        me {
            id
            name
            username
            photoURLSource
            photoURLMedium
            photoURLSmall
        }
    }
`;

export const REGISTER_MUTATION = gql`
    mutation RegisterMutation($registerInput: UserCreation!) {
        register(input: $registerInput) {
            id
            name
            username
            photoURLSource
            photoURLMedium
            photoURLSmall
        }
    }
`;

export const UPDATE_USER_MUTATION = gql`
    mutation UpdateUserMutation($updateUserInput: UserUpdate!) {
        updateUser(input: $updateUserInput) {
            id
            name
            username
            photoURLSource
            photoURLMedium
            photoURLSmall
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