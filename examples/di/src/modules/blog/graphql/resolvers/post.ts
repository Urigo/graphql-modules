import { Blog } from '../../implementations/blog';

export const resolvers = {
    Post: {
      id: post => post._id,
      title: post => post.title,
      author: (post, args, { blog }) => {
        return blog.get(Blog).getAuthor(post.authorId);
      },
    },
  };
