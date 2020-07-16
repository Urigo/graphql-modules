const { GraphQLModule } = require('@graphql-modules/core');
const { UserModule } = require('../user');
const { BlogModule } = require('../blog');

module.exports.AppModule = new GraphQLModule({
  imports: [
    UserModule,
    BlogModule,
  ],
});
