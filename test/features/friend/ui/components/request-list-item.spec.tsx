import React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import RequestListItem, {RequestListItemProps} from "../../../../../src/features/friend/ui/components/request-list-item";
import {mockFriend, mockFriendRequests} from "../../../../mock-objects";
import User from "../../../../../src/features/user/types/user";
import {formatDate} from "../../../../../src/utils/date-utils";

const renderIt = (props: RequestListItemProps) => {
  render(<RequestListItem {...props}/>);
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
  const props: RequestListItemProps = {req: {user, date: new Date().getTime()}};
  // render
  renderIt(props);
  // assert
  expect(screen.getByText(user.username)).toBeInTheDocument();
  expect(screen.getByText(formatDate(props.req.date))).toBeInTheDocument();
  const avatar = screen.getByAltText('request-avatar') as HTMLImageElement;
  expect(avatar.src).toMatch(user.photo!.small);
});

describe('request confirmed (Friends)', () => {
  it('should not display actions', () => {
    // arrange
    const props: RequestListItemProps = {
      req: mockFriend,
      confirmed: true
    };
    // render
    renderIt(props);
    // assert
    expect(screen.queryByTestId('request-actions')).not.toBeInTheDocument();
  });
});

describe('received request', () => {
  const req = mockFriendRequests.received[0];
  it('should display cancel and accept buttons when not loading', () => {
    // arrange
    const onCancel = jest.fn();
    const onAccept = jest.fn();
    const props: RequestListItemProps = {
      req,
      received: true,
      onCancel,
      onAccept
    };
    // render
    renderIt(props);
    // assert
    const cancelButton = screen.getByTestId('cancel-request');
    const acceptButton = screen.getByTestId('accept-request');
    fireEvent.click(cancelButton);
    expect(onCancel).toBeCalledTimes(1);
    fireEvent.click(acceptButton);
    expect(onAccept).toBeCalledTimes(1);
    expect(screen.queryByTestId('request-loading')).not.toBeInTheDocument();
  });

  it('should display a spinner when loading', () => {
    // arrange
    const props: RequestListItemProps = {
      req,
      received: true,
      loading: true
    };
    // render
    renderIt(props);
    // assert
    expect(screen.queryByTestId('cancel-request')).not.toBeInTheDocument();
    expect(screen.queryByTestId('accept-request')).not.toBeInTheDocument();
    expect(screen.getByTestId('request-loading')).toBeInTheDocument();
  });
});

describe('sent request', () => {
  const req = mockFriendRequests.sent[0];
  it('should display a cancel button when not loading', () => {
    // arrange
    const onCancel = jest.fn();
    const props: RequestListItemProps = {
      req,
      onCancel,
    };
    // render
    renderIt(props);
    // assert
    const cancelButton = screen.getByTestId('cancel-request');
    fireEvent.click(cancelButton);
    expect(onCancel).toBeCalledTimes(1);
    expect(screen.queryByTestId('accept-request')).not.toBeInTheDocument();
    expect(screen.queryByTestId('request-loading')).not.toBeInTheDocument();
  });

  it('should display a spinner when loading', () => {
    // arrange
    const props: RequestListItemProps = {
      req,
      loading: true
    };
    // render
    renderIt(props);
    // assert
    expect(screen.queryByTestId('cancel-request')).not.toBeInTheDocument();
    expect(screen.queryByTestId('accept-request')).not.toBeInTheDocument();
    expect(screen.getByTestId('request-loading')).toBeInTheDocument();
  });
});
