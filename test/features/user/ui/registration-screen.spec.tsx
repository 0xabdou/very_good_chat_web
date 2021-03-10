import React from "react";
import {
  getMockAuthActions,
  getMockStore,
  getMockUserActions,
  initialUserState,
  loggedInAuthState,
  mockAuthActionObjects,
  mockUserActionObjects
} from "../../../mock-objects";
import {AppState, AppStore} from "../../../../src/store/store";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from "@testing-library/react";
import {Provider} from "react-redux";
import {UserActionsContext} from "../../../../src/features/user/user-actions-context";
import {AuthActionsContext} from "../../../../src/features/auth/auth-actions-context";
import {beforeEach, describe, test} from "@jest/globals";
import RegistrationScreen
  from "../../../../src/features/user/ui/registraion-screen";
import {
  IPhotoUtils,
  PhotoUtilsContext
} from "../../../../src/utils/photo-utils";
import {anything, instance, mock, when} from "ts-mockito";
import {UserCreation} from "../../../../src/features/user/types/user";

let mockAuthActions = getMockAuthActions();
let mockUserActions = getMockUserActions();
const MockStore = getMockStore();
const MockPhotoUtils = mock<IPhotoUtils>();

const userState = initialUserState;
const authState = loggedInAuthState;
const initialState = {
  user: userState,
  auth: authState,
} as AppState;

const renderComponent = (mockStore: AppStore) => {
  render(
    <PhotoUtilsContext.Provider value={instance(MockPhotoUtils)}>
      <Provider store={mockStore}>
        <AuthActionsContext.Provider value={mockAuthActions}>
          <UserActionsContext.Provider value={mockUserActions}>
            <RegistrationScreen/>
          </UserActionsContext.Provider>
        </AuthActionsContext.Provider>
      </Provider>
    </PhotoUtilsContext.Provider>
  );
};

beforeEach(() => {
  mockAuthActions = getMockAuthActions();
  mockUserActions = getMockUserActions();
});

test('Should display all the required components', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  expect(screen.getByTestId('profile-photo-picker')).toBeInTheDocument();
  expect(screen.getByTestId('username-text-field')).toBeInTheDocument();
  expect(screen.getByTestId('name-text-field')).toBeInTheDocument();
  expect(screen.getByTestId('registration-button')).toBeInTheDocument();
});

test(
  `should prefill the name text field and the profile picture with 
  data from the authUser if they exist`,
  async () => {
    // arrange
    const authUser = {
      displayName: 'Display Name',
      photoURL: 'https://picsum.photos/4000',
    };
    const state: AppState = {
      user: userState,
      auth: {
        ...authState,
        authUser,
      }
    };
    const mockStore = MockStore(state);
    // render
    renderComponent(mockStore);
    // assert
    expect(await screen.findByDisplayValue(authUser.displayName)).toBeInTheDocument();
    const pp = screen.getByAltText('profile photo') as HTMLImageElement;
    expect(pp).toBeInTheDocument();
    expect(pp.src).toStrictEqual(authUser.photoURL);
  },
);

test(
  'Should display a loader in place of the button if the user is being registered',
  () => {
    // arrange
    const loadingState: AppState = {
      ...initialState,
      user: {...userState, creatingUser: true},
    };
    const mockStore = MockStore(loadingState);
    // act
    renderComponent(mockStore);
    // assert
    expect(screen.queryByTestId('registration-button')).toBeNull();
    expect(screen.getByTestId('registration-loading')).toBeInTheDocument();
  }
);

describe('Logging out', () => {
  test('clicking the logout button should display a confirmation dialog', async () => {
    // arrange
    const mockStore = MockStore(initialState);
    // act
    renderComponent(mockStore);
    // assert
    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);
    expect(await screen.findByTestId('alert-dialog')).toBeInTheDocument();
    screen.debug();
  });

  test('confirming the logout should dispatch a logout action', async () => {
    // arrange
    const mockStore = MockStore(initialState);
    // act
    // render the whole page
    renderComponent(mockStore);
    // click the logout button
    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);
    // wait for the dialog to appear
    await screen.findByTestId('alert-dialog');
    // click the confirm button
    const confirmButton = screen.getByTestId('alert-confirm');
    fireEvent.click(confirmButton);
    // wait for dialog disappearance
    await waitForElementToBeRemoved(() => screen.queryByTestId('alert-dialog'));
    // assert
    expect(mockUserActions.resetUser).toBeCalledTimes(1);
    expect(mockAuthActions.signOut).toBeCalledTimes(1);
    expect(mockStore.getActions()).toContain(mockUserActionObjects.resetUser);
    expect(mockStore.getActions()).toContain(mockAuthActionObjects.signOut);
  });

  test(
    'canceling the logout should make the dialog disappear, and dispatch no actions',
    async () => {
      // arrange
      const mockStore = MockStore(initialState);
      console.log('ACTION0: ', mockStore.getActions());
      // act
      // render the whole page
      renderComponent(mockStore);
      // click the logout button
      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);
      // wait for the dialog to appear
      await screen.findByTestId('alert-dialog');
      // click the confirm button
      const cancelButton = screen.getByTestId('alert-cancel');
      fireEvent.click(cancelButton);
      // wait for dialog disappearance
      await waitForElementToBeRemoved(() => screen.queryByTestId('alert-dialog'));
      // assert
      expect(mockUserActions.resetUser).toBeCalledTimes(0);
      expect(mockAuthActions.signOut).toBeCalledTimes(0);
      expect(mockStore.getActions()).toHaveLength(0);
    },
  );
});

test(
  'Selecting photo',
  async () => {
    // arrange
    const file = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});
    const url = 'https://chucknorris.com';
    const croppedUrl = 'https://chucknorris.com/cropped';
    const mockStore = MockStore(initialState);
    when(MockPhotoUtils.getPhotoDimensions(anything())).thenResolve({
      height: 100,
      width: 100
    });
    when(MockPhotoUtils.photoToURL(file)).thenResolve(url);
    when(MockPhotoUtils.cropPhoto(url, anything())).thenResolve(croppedUrl);
    // act
    renderComponent(mockStore);
    const dropzone = screen.getByTestId('profile-photo-drop-zone');
    Object.defineProperty(dropzone, 'files', {value: [file]});
    // assert
    // PhotoCropper should appear if a photo was selected
    fireEvent.drop(dropzone);
    const photoCropper = await screen.findByTestId('photo-cropper');
    expect(photoCropper).toBeInTheDocument();
    // Cropping the photo should make the PhotoCropper disappear
    // and update the img with the new src
    const cropButton = screen.getByTestId('confirm-crop');
    fireEvent.click(cropButton);
    await waitForElementToBeRemoved(() => screen.queryByTestId('photo-cropper'));
    const profilePhoto = screen.getByAltText('profile photo') as HTMLImageElement;
    expect(profilePhoto.src).toStrictEqual(croppedUrl);
    // PhotoCropper should appear again if another photo was dropped
    fireEvent.drop(dropzone);
    const photoCropper2 = await screen.findByTestId('photo-cropper');
    expect(photoCropper2).toBeInTheDocument();
    // Canceling the crop should make the PhotoCropper disappear,
    // and not update the img src
    const cancelButton = screen.getByTestId('cancel-crop');
    fireEvent.click(cancelButton);
    await waitForElementToBeRemoved(() => screen.queryByTestId('photo-cropper'));
    expect(profilePhoto.src).toStrictEqual(croppedUrl);
    // Clicking the edit button on the profile photo picker should display a menu
    // with an option to remove the selected photo
    const editButton = screen.getByTestId('edit-profile-photo');
    fireEvent.click(editButton);
    const removeButton = await screen.findByTestId('profile-photo-clear');
    expect(removeButton).toBeInTheDocument();
    // clicking the remove button should display a confirmation dialog
    fireEvent.click(removeButton);
    const confirmRemovalButton = await screen.findByTestId('alert-confirm');
    expect(confirmRemovalButton).toBeInTheDocument();
    // clicking the confirm button should hide the dialog and reset the profile img src
    fireEvent.click(confirmRemovalButton);
    await waitForElementToBeRemoved(() => screen.queryByTestId('alert-confirm'));
    const defaultPPRegex = /\/images\/default-pp\.png/;
    expect(defaultPPRegex.test(profilePhoto.src)).toBeTruthy();
  },
);

test(
  'Should dispatch createUser action with the info entered by the user',
  async () => {
    // arrange
    const mockStore = MockStore(initialState);
    const file = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});
    const url = 'https://chucknorris.com';
    const croppedUrl = 'https://chucknorris.com/cropped';
    when(MockPhotoUtils.getPhotoDimensions(anything())).thenResolve({
      height: 100,
      width: 100
    });
    when(MockPhotoUtils.photoToURL(file)).thenResolve(url);
    when(MockPhotoUtils.cropPhoto(url, anything())).thenResolve(croppedUrl);
    when(MockPhotoUtils.urlToPhoto(croppedUrl)).thenResolve(file);
    // act
    renderComponent(mockStore);
    // pick a photo
    const dropZone = screen.getByTestId('profile-photo-drop-zone');
    Object.defineProperty(dropZone, 'files', {value: [file]});
    fireEvent.drop(dropZone);
    await screen.findByTestId('photo-cropper');
    const cropButton = screen.getByTestId('confirm-crop');
    fireEvent.click(cropButton);
    await waitForElementToBeRemoved(() => screen.queryByTestId('photo-cropper'));
    // Find text fields
    const textFields = screen.getAllByRole('textbox');
    // enter a wrong username
    const usernameTF = textFields[0] as HTMLInputElement;
    fireEvent.change(usernameTF, {target: {value: 'wrong_username.'}});
    // enter a name
    const nameTF = textFields[1] as HTMLInputElement;
    fireEvent.change(nameTF, {target: {value: 'chuck norris'}});
    // click the save button
    const saveButton = screen.getByTestId('registration-button');
    fireEvent.click(saveButton);
    // assert that no action was dispatch to redux
    expect(mockStore.getActions()).toHaveLength(0);
    // enter a valid username
    fireEvent.change(usernameTF, {target: {value: 'chuck_norris'}});
    // click the save button again
    fireEvent.click(saveButton);
    // assert that createUser action was dispatched to redux
    await waitFor(() => expect(mockUserActions.createUser).toHaveBeenCalledTimes(1));
    const creation: UserCreation = {
      photo: file,
      username: 'chuck_norris',
      name: 'chuck norris',
    };
    expect(mockStore.getActions()).toContain(mockUserActionObjects.createUser);
    expect(mockUserActions.createUser).toBeCalledWith(creation);
  },
);