import {FileUtils} from "../../src/utils/file-utils";

const photo = {} as File;
const url = 'photo url';

const photoUtils = new FileUtils();

beforeAll(() => {
  global.URL = {
    createObjectURL: jest.fn(() => url),
  } as unknown as typeof global.URL;
});

describe('photoToURL', () => {
  it('should call URL.createObjectURL', async () => {
    // act
    const res = await photoUtils.fileToURL(photo);
    // assert
    expect(global.URL.createObjectURL).toBeCalledWith(photo);
    expect(global.URL.createObjectURL).toBeCalledTimes(1);
    expect(res).toBe(url);
  });
});