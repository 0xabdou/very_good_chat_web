import {Badge, BadgeName} from "../../types/badge";
import {ApolloClient} from "@apollo/client";
import {GetBadges} from "../../../../_generated/GetBadges";
import {GET_BADGES_QUERY, UPDATE_BADGE_MUTATION} from "../graphql";
import {
  UpdateBadge,
  UpdateBadgeVariables
} from "../../../../_generated/UpdateBadge";

export interface IBadgeAPI {
  getBadges(): Promise<Badge[]>;

  updateBadge(badgeName: BadgeName): Promise<Badge>;
}

export default class BadgeAPI implements IBadgeAPI {
  private readonly _client: ApolloClient<any>;

  constructor(client: ApolloClient<any>) {
    this._client = client;
  }

  async getBadges(): Promise<Badge[]> {
    const {data} = await this._client.query<GetBadges>({
      query: GET_BADGES_QUERY,
      fetchPolicy: "no-cache"
    });
    return data.getBadges;
  }

  async updateBadge(badgeName: BadgeName): Promise<Badge> {
    const {data} = await this._client.mutate<UpdateBadge, UpdateBadgeVariables>({
      mutation: UPDATE_BADGE_MUTATION,
      variables: {badgeName},
    });
    return data?.updateBadge!;
  }
}