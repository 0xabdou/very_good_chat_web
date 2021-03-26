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
import {AppDispatch, AppState, AppStore} from "../../../../src/store/store";
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
import ProfileUpdatingScreen, {ProfileUpdatingScreenProps} from "../../../../src/features/user/ui/profile-updating-screen";
import {
  IPhotoUtils,
  PhotoUtilsContext
} from "../../../../src/utils/photo-utils";
import {anything, instance, mock, when} from "ts-mockito";
import {
  UserCreation,
  UserUpdate
} from "../../../../src/features/user/types/user";

let mockAuthActions = getMockAuthActions();
let mockUserActions = getMockUserActions();
const MockStore = getMockStore();
const MockPhotoUtils = mock<IPhotoUtils>();

const userState = initialUserState;
const initialState = {
  user: userState,
  auth: loggedInAuthState,
} as AppState;

const renderComponent = (
  mockStore: AppStore,
  props: ProfileUpdatingScreenProps = {},
) => {
  render(
    <PhotoUtilsContext.Provider value={instance(MockPhotoUtils)}>
      <Provider store={mockStore}>
        <AuthActionsContext.Provider value={mockAuthActions}>
          <UserActionsContext.Provider value={mockUserActions}>
            <ProfileUpdatingScreen {...props} />
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
  expect(screen.getByTestId('profile-photo-picker')).toBeInTheDocument();
  expect(screen.getByTestId('username-text-field')).toBeInTheDocument();
  expect(screen.getByTestId('name-text-field')).toBeInTheDocument();
  expect(screen.getByTestId('submit-button')).toBeInTheDocument();
});

it('should display a logout button if registering', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore, {registering: true});
  // assert
  expect(screen.getByTestId('logout-button')).toBeInTheDocument();
});

it('should not display a logout button if not registering', () => {
  // arrange
  const mockStore = MockStore(initialState);
  // act
  renderComponent(mockStore);
  // assert
  expect(screen.queryByTestId('logout-button')).toBeNull();
});

test(
  `should prefill the username and name text fields, and the profile picture`,
  async () => {
    // arrange
    const initialData: ProfileUpdatingScreenProps = {
      initialUsername: 'initial.username',
      initialName: 'Initial Name',
      initialPhotoURL: 'https://intial-photo.url'
    };
    const mockStore = MockStore(initialState);
    // render
    renderComponent(mockStore, initialData);
    // assert
    expect(await screen.findByDisplayValue(initialData.initialUsername!))
      .toBeInTheDocument();
    expect(await screen.findByDisplayValue(initialData.initialName!))
      .toBeInTheDocument();
    const pp = screen.getByAltText('profile photo') as HTMLImageElement;
    expect(pp).toBeInTheDocument();
    expect(pp.src).toMatch(initialData.initialPhotoURL!);
  },
);

test(
  'Should display a loader in place of the button if the user is being updated',
  () => {
    // arrange
    const loadingState: AppState = {
      ...initialState,
      user: {...userState, updatingUser: true},
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
    renderComponent(mockStore, {registering: true});
    // assert
    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);
    expect(await screen.findByTestId('alert-dialog')).toBeInTheDocument();
  });

  test('confirming the logout should dispatch a logout action', async () => {
    // arrange
    const mockStore = MockStore(initialState);
    // act
    // render the whole page
    renderComponent(mockStore, {registering: true});
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
      // act
      // render the whole page
      renderComponent(mockStore, {registering: true});
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
    const removeButton = await screen.findByTestId('menu-item-clear');
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
    renderComponent(mockStore, {registering: true});
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
    const saveButton = screen.getByTestId('submit-button');
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

describe('updating profile', () => {
  const initialData: ProfileUpdatingScreenProps = {
    initialUsername: 'initial.username',
    initialName: 'Initial Name',
    initialPhotoURL: 'https://intial-photo.url'
  };

  const mockTheStore = () => {
    const mockStore = MockStore(initialState);
    const ogDispatch = mockStore.dispatch;
    const mockDispatch = jest.fn(async (action) => {
      ogDispatch(action);
      return {meta: {requestStatus: 'fulfilled'}};
    });
    mockStore.dispatch = mockDispatch as AppDispatch;
    return mockStore;
  };

  it(
    'should only update the username if it is the only thing that changed',
    async () => {
      // arrange
      const mockStore = mockTheStore();
      // render
      renderComponent(mockStore, initialData);
      // change username
      const textFields = screen.getAllByRole('textbox');
      const usernameTF = textFields[0] as HTMLInputElement;
      const changedUsername = 'changed_username';
      fireEvent.change(usernameTF, {target: {value: changedUsername}});
      // submit
      const saveButton = screen.getByTestId('submit-button');
      fireEvent.click(saveButton);
      // assert
      await waitFor(() => expect(mockUserActions.updateUser).toBeCalledTimes(1));
      const usernameUpdate: UserUpdate = {username: changedUsername};
      expect(mockUserActions.updateUser).toBeCalledWith(usernameUpdate);
      expect(mockStore.getActions()).toContain(mockUserActionObjects.updateUser);
    },
  );

  it(
    'should only update the username if it is the only thing changed',
    async () => {
      // arrange
      const mockStore = mockTheStore();
      // render
      renderComponent(mockStore, initialData);
      // change name
      const textFields = screen.getAllByRole('textbox');
      const nameTF = textFields[1] as HTMLInputElement;
      const changedName = 'changed name';
      fireEvent.change(nameTF, {target: {value: changedName}});
      // submit
      const saveButton = screen.getByTestId('submit-button');
      fireEvent.click(saveButton);
      // assert
      await waitFor(() => expect(mockUserActions.updateUser).toBeCalledTimes(1));
      const nameUpdate: UserUpdate = {name: changedName};
      expect(mockUserActions.updateUser).toBeCalledWith(nameUpdate);
      expect(mockStore.getActions()).toContain(mockUserActionObjects.updateUser);
    }
  );

  it(
    'should only delete the username if it is the only thing deleted',
    async () => {
      // arrange
      const mockStore = mockTheStore();
      // render
      renderComponent(mockStore, initialData);
      // chang namee
      const textFields = screen.getAllByRole('textbox');
      const nameTF = textFields[1] as HTMLInputElement;
      fireEvent.change(nameTF, {target: {value: ''}});
      // submit
      const saveButton = screen.getByTestId('submit-button');
      fireEvent.click(saveButton);
      // assert
      await waitFor(() => expect(mockUserActions.updateUser).toBeCalledTimes(1));
      const nameUpdate: UserUpdate = {deleteName: true};
      expect(mockUserActions.updateUser).toBeCalledWith(nameUpdate);
      expect(mockStore.getActions()).toContain(mockUserActionObjects.updateUser);
    }
  );

  it(
    'should only update the photo if it is the only thing changed',
    async () => {
      // arrange
      const mockStore = mockTheStore();
      // render
      renderComponent(mockStore, initialData);
      // change photo
      const url = 'https://picsum.com/url/';
      const file = new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'});
      when(MockPhotoUtils.urlToPhoto(anything())).thenResolve(file);
      when(MockPhotoUtils.photoToURL(anything())).thenResolve(url);
      when(MockPhotoUtils.cropPhoto(anything(), anything())).thenResolve(url);
      when(MockPhotoUtils.getPhotoDimensions(anything())).thenResolve({
        height: 100,
        width: 100
      });
      const dropZone = screen.getByTestId('profile-photo-drop-zone');
      Object.defineProperty(dropZone, 'files', {value: [file]});
      fireEvent.drop(dropZone);
      await screen.findByTestId('photo-cropper');
      const cropButton = screen.getByTestId('confirm-crop');
      fireEvent.click(cropButton);
      await waitForElementToBeRemoved(() => screen.queryByTestId('photo-cropper'));
      // submit
      const saveButton = screen.getByTestId('submit-button');
      fireEvent.click(saveButton);
      // assert
      await waitFor(() => expect(mockUserActions.updateUser).toBeCalledTimes(1));
      const photoUpdate: UserUpdate = {photo: file};
      expect(mockUserActions.updateUser).toBeCalledWith(photoUpdate);
      expect(mockStore.getActions()).toContain(mockUserActionObjects.updateUser);
    }
  );

  it(
    'should only delete the photo if it is the only thing deleted',
    async () => {
      // arrange
      const mockStore = mockTheStore();
      // render
      renderComponent(mockStore, initialData);
      // delete photo
      const editButton = screen.getByTestId('edit-profile-photo');
      fireEvent.click(editButton);
      const clearButton = await screen.findByTestId('menu-item-clear');
      fireEvent.click(clearButton);
      const confirmButton = await screen.findByTestId('alert-confirm');
      fireEvent.click(confirmButton);
      await waitForElementToBeRemoved(
        () => screen.queryByTestId('alert-confirm')
      );
      // submit
      const saveButton = screen.getByTestId('submit-button');
      fireEvent.click(saveButton);
      // assert
      await waitFor(() => expect(mockUserActions.updateUser).toBeCalledTimes(1));
      const photoUpdate: UserUpdate = {deletePhoto: true};
      expect(mockUserActions.updateUser).toBeCalledWith(photoUpdate);
      expect(mockStore.getActions()).toContain(mockUserActionObjects.updateUser);
    }
  );

  it(
    'should not dispatch anything if nothing changed',
    async () => {
      // arrange
      const mockStore = mockTheStore();
      // render
      renderComponent(mockStore, initialData);
      // submit
      const saveButton = screen.getByTestId('submit-button');
      fireEvent.click(saveButton);
      // assert
      expect(mockUserActions.updateUser).toBeCalledTimes(0);
      expect(mockStore.getActions()).toHaveLength(0);
    }
  );
});