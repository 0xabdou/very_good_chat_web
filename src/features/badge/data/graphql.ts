import {gql} from "@apollo/client";

export const GET_BADGES_QUERY = gql`
    query GetBadges {
        getBadges {
            badgeName
            lastOpened
        }
    }
`;

export const UPDATE_BADGE_MUTATION = gql`
    mutation UpdateBadge($badgeName: BadgeName!) {
        updateBadge(badgeName: $badgeName)  {
            badgeName
            lastOpened
        }
    }
`;