import React from "react";
import {render, screen} from "@testing-library/react";
import NotificationListItem, {NotificationListItemProps} from "../../../../../src/features/notification/ui/components/notification-list-item";
import {mockRANotification} from "../../../../mock-objects";
import {RequestAcceptedNotification} from "../../../../../src/features/notification/types/notification";
import TimeAgo from "javascript-time-ago";

const renderIt = (props: NotificationListItemProps) => {
  render(
    <NotificationListItem {...props} />
  );
};

it('should display all required components', () => {
  // arrange
  const onClick = jest.fn();
  const props: NotificationListItemProps = {
    notification: mockRANotification,
    onClick
  };
  const content = props.notification.content as RequestAcceptedNotification;
  // render
  renderIt(props);
  // assert
  const avatar = screen.getByAltText('notification-avatar') as HTMLImageElement;
  expect(avatar.src).toMatch(content.user.photo!.small);
  expect(screen.getByText(content.user.username)).toBeInTheDocument();
  expect(screen.getByText(new TimeAgo().format(props.notification.date))).toBeInTheDocument();
});