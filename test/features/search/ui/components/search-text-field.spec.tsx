import React from "react";
import {getMockStore} from "../../../../mock-objects";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import {AppState, AppStore} from "../../../../../src/core/redux/store";
import {SearchActionsContext} from "../../../../../src/features/search/search-actions-context";
import SearchTextField
  from "../../../../../src/features/search/ui/components/search-text-field";
import {
  initialSearchState,
  searchActions,
} from "../../../../../src/features/search/search-slice";
import {anything, instance, mock, resetCalls, verify, when} from "ts-mockito";

const MockStore = getMockStore();
let MockSearchActions = mock<typeof searchActions>();
let onFocus = jest.fn();
let onBack = jest.fn();
const searchAction = {type: 'search'} as any;

const initialState = {
  search: initialSearchState
} as AppState;

const renderComponent = (mockStore: AppStore) => {
  render(
    <Provider store={mockStore}>
      <SearchActionsContext.Provider value={instance(MockSearchActions)}>
        <SearchTextField onFocus={onFocus} onBack={onBack}/>
      </SearchActionsContext.Provider>
    </Provider>
  );
};

beforeAll(() => {
  when(MockSearchActions.searchForUsers(anything())).thenReturn(searchAction);
});

beforeEach(() => {
  onFocus = jest.fn();
  onBack = jest.fn();
  resetCalls(MockSearchActions);
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
    await waitFor(() => verify(MockSearchActions.searchForUsers('ab')).once());
    expect(mockStore.getActions()).toHaveLength(1);
    expect(mockStore.getActions()[0]).toStrictEqual(searchAction);
  }
);