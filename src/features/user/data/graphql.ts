import {gql} from "@apollo/client";

export const ME_QUERY = gql`
    query MeQuery {
        me {
            id
            name
            photoURL
            username
        }
    }
`;

export const REGISTER_MUTATION = gql`
    mutation RegisterMutation($registerInput: UserCreation!) {
        register(input: $registerInput) {
            id
            name
            photoURL
            username
        }
    }
`;

export const USERNAME_EXISTENCE_QUERY = gql`
    query UsernameExistenceQuery($username: String!) {
        checkUsernameExistence(username: $username)
    }
`;