import { AppContext } from '@graphql-modules/core';

import { Blog } from '../providers/blog';

export default {
  Post: {
    id: post => post._id,
    title: post => post.title,
    author: (post, args, {injector}: AppContext) => injector.get(Blog).getAuthor(post.authorId),
  },
};
