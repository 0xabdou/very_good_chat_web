import {PhotoUtils} from "../../src/utils/photo-utils";

const photo = {} as File;
const url = 'photo url';

const photoUtils = new PhotoUtils();

beforeAll(() => {
  global.URL = {
    createObjectURL: jest.fn(() => url),
  } as unknown as typeof global.URL;
});

describe('photoToURL', () => {
  it('should call URL.createObjectURL', async () => {
    // act
    const res = await photoUtils.photoToURL(photo);
    // assert
    expect(global.URL.createObjectURL).toBeCalledWith(photo);
    expect(global.URL.createObjectURL).toBeCalledTimes(1);
    expect(res).toBe(url);
  });
});