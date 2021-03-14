import React from "react";
import {
  getMockSearchActions,
  getMockStore,
  mockSearchActionObjects
} from "../../../../mock-objects";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import {AppState, AppStore} from "../../../../../src/store/store";
import {SearchActionsContext} from "../../../../../src/features/search/search-actions-context";
import SearchTextField
  from "../../../../../src/features/search/ui/components/search-text-field";
import {initialSearchState,} from "../../../../../src/features/search/search-slice";

const MockStore = getMockStore();
let mockSearchActions = getMockSearchActions();
let {searchForUsers} = mockSearchActions;
let onFocus = jest.fn();
let onBack = jest.fn();

const initialState = {
  search: initialSearchState
} as AppState;

const renderComponent = (mockStore: AppStore) => {
  render(
    <Provider store={mockStore}>
      <SearchActionsContext.Provider value={mockSearchActions}>
        <SearchTextField onFocus={onFocus} onBack={onBack}/>
      </SearchActionsContext.Provider>
    </Provider>
  );
};

beforeEach(() => {
  onFocus = jest.fn();
  onBack = jest.fn();
  mockSearchActions = getMockSearchActions();
  ({searchForUsers} = mockSearchActions);
});

test(
  'Successive input changes should dispatch a single action',
  async () => {
    // arrange
    const mockStore = MockStore(initialState);
    // render
    renderComponent(mockStore);
    // act
    const textField = screen.getByRole('textbox');
    // first change
    fireEvent.change(textField, {target: {value: 'a'}});
    await new Promise<void>((r) => {
      setTimeout(() => r(), 200);
    });
    // second change after 200ms delay
    fireEvent.change(textField, {target: {value: 'ab'}});
    // assert
    await waitFor(() => expect(searchForUsers).toBeCalledWith('ab'));
    expect(searchForUsers).toBeCalledTimes(1);
    expect(mockStore.getActions()).toHaveLength(1);
    expect(mockStore.getActions()[0])
      .toStrictEqual(mockSearchActionObjects.searchForUsers);
  }
);