import React from 'react';
import BlockedListItem, {BlockedListItemProps} from "../../../../../src/features/block/ui/components/blocked-list-item";
import {render, screen} from "@testing-library/react";
import {mockBlock} from "../../../../mock-objects";

const renderIt = (props: BlockedListItemProps) => {
  render(
    <BlockedListItem {...props} />
  );
};

it('should render the required components', () => {
  // arrange
  const onClick = jest.fn();
  const props: BlockedListItemProps = {
    block: mockBlock,
    onClick
  };
  // render
  renderIt(props);
  // assert
  expect(screen.getByText(props.block.user.username)).toBeInTheDocument();
  const avatar = screen.getByAltText('blocked-profile-picture') as HTMLImageElement;
  expect(avatar.src).toMatch(props.block.user.photo!.small);
});