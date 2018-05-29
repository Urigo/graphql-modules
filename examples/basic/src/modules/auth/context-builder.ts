import { Request } from 'express';

export const contextBuilder = (req: Request) => {
  return {
    authenticatedUser: {
      _id: 1,
      username: 'me',
    }
  };
};
