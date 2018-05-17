import { mergeResolvers } from '../src';

describe('Merge Resolvers', function () {
  it('should return the correct value when falsely value provided', () => {
    expect(mergeResolvers(null)).toEqual({});
  });

  it('should return the correct value when empty array provided', () => {
    expect(mergeResolvers([])).toEqual({});
  });

  it('should return the correct value when one value array provided', () => {
    expect(mergeResolvers([
      { User: {} }
    ])).toEqual({
      User: {}
    });
  });

  it('should return the correct when multiple values provided', () => {
    expect(mergeResolvers([
      { User: {} },
      { MyType: {} }
    ])).toEqual({
      User: {},
      MyType: {}
    });
  });

  it('should merge first level fields', () => {
    expect(mergeResolvers([
      { User: { f1: 1 } },
      { User: { f2: 2 } },
    ])).toEqual({
      User: {
        f1: 1,
        f2: 2,
      }
    });
  });
});
