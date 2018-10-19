import { Blog } from '../providers/blog';
import { AppContext } from '@graphql-modules/core';

export default {
  Post: {
    id: post => post._id,
    title: post => post.title,
    author: (post, args, { injector }: AppContext) => injector.get(Blog).getAuthor(post.authorId),
  },
};
