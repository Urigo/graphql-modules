import { injectable } from '../../../../../../packages/core/dist';

const posts = [{
    _id: 0,
    authorId: 0,
    title: 'Title 1',
}, {
    _id: 1,
    authorId: 1,
    title: 'Title 2',
}, {
    _id: 2,
    authorId: 0,
    title: 'Title 3',
}];

@injectable()
export class Blog {
    getPostsOf(userId: number) {
        return posts.filter(({authorId}) => userId === authorId);
    }

    allPosts() {
        return posts;
    }
}
