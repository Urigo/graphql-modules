import { Blog } from '../providers/blog';

export default {
  Post: {
    id: (post: any) => post._id,
    title: (post: any) => post.title,
    author: (post: any, _args: {}, { injector }: GraphQLModules.Context) =>
      injector.get(Blog).getAuthor(post.authorId),
  },
};
