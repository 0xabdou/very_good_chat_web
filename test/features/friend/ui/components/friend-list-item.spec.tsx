import React from "react";
import {render, screen} from "@testing-library/react";
import {mockFriend,} from "../../../../mock-objects";
import User from "../../../../../src/features/user/types/user";
import {formatDate} from "../../../../../src/utils/date-utils";
import FriendListItem, {FriendListItemProps} from "../../../../../src/features/friend/ui/components/friend-list-item";

const renderIt = (props: FriendListItemProps) => {
  render(<FriendListItem {...props}/>);
};

it('should display user info', () => {
  // arrange
  const user: User = {
    id: 'idddddd',
    username: 'usernameeeeeeeeee',
    name: 'anememem anameeeeee',
    photo: {
      source: 'souuuuuurce',
      medium: 'meeeeeeeediummmmmm',
      small: 'smaooolllllll'
    }
  };
  const props: FriendListItemProps = {
    friend: {user, date: new Date().getTime()}
  };
  // render
  renderIt(props);
  // assert
  expect(screen.getByText(user.username)).toBeInTheDocument();
  expect(screen.getByText(user.name!)).toBeInTheDocument();
  const avatar = screen.getByAltText('friend-avatar') as HTMLImageElement;
  expect(avatar.src).toMatch(user.photo!.small);
});

it('should not display the last seen date if the user is online', () => {
  // arrange
  const props: FriendListItemProps = {
    friend: {
      ...mockFriend,
      lastSeen: new Date().getTime()
    }
  };
  // render
  renderIt(props);
  // assert
  const lastSeen = formatDate(props.friend.lastSeen!, 'mini');
  expect(screen.queryByText(lastSeen)).not.toBeInTheDocument();
});

it('should display the last seen date ff the user is offline', () => {
  // arrange
  const props: FriendListItemProps = {
    friend: {
      ...mockFriend,
      lastSeen: new Date().getTime() - 60001
    }
  };
  // render
  renderIt(props);
  // assert
  const lastSeen = formatDate(props.friend.lastSeen!, 'mini');
  expect(screen.queryByText(lastSeen)).toBeInTheDocument();
});