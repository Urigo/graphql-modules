import type { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import {
  DocsContent,
  DocsTOC,
  MDXPage,
  EditOnGitHubButton,
} from '@guild-docs/client';
import { MDXPaths, MDXProps } from '@guild-docs/server';
import { getRoutes } from '../../../routes';

export default MDXPage(function PostPage({
  content,
  TOC,
  MetaHead,
  sourceFilePath,
}) {
  return (
    <>
      <Head>{MetaHead}</Head>
      <DocsContent>{content}</DocsContent>
      <DocsTOC>
        <TOC />
        <EditOnGitHubButton
          repo="urigo/graphql-modules"
          branch="master"
          baseDir="website"
          sourceFilePath={sourceFilePath}
        />
      </DocsTOC>
    </>
  );
});

export const getStaticProps: GetStaticProps = (ctx) => {
  return MDXProps(
    ({ readMarkdownFile, getArrayParam }) => {
      return readMarkdownFile('docs/', getArrayParam('slug'));
    },
    ctx,
    { getRoutes }
  );
};

export const getStaticPaths: GetStaticPaths = (ctx) => {
  return MDXPaths('docs', { ctx });
};
