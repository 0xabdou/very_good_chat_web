import {gql} from "@apollo/client";

export const LOGIN_WITH_GOOGLE = gql`
    mutation LoginWithGoogleMutation($loginWithGoogleInput: LoginInput!) {
        loginWithGoogle(input: $loginWithGoogleInput) {
            accessToken
            authUser {
                displayName
                photoUrl
            }
        }
    }
`;