import query from './query';
import user from './user';
import post from './post';

export default {
  ...user,
  ...query,
  ...post,
};
