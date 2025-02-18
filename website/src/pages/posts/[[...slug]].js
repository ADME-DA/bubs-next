import LayoutDefault from 'components/layouts/LayoutDefault';
import PostArchive from 'components/post/PostArchive';

import { GlobalsProvider } from 'contexts/GlobalsContext';
import { staticPropHelper, staticPathGenerator } from 'lib/archive';
import checkRedirects from 'lib/checkRedirects';
import { getContent, getGlobalProps } from 'lib/wordpress';
import { useRouter } from 'next/router';

function PostsSinglePage({ post, globals, preview }) {
  return (
    <GlobalsProvider globals={globals}>
      <LayoutDefault
        title={post?.title}
        preview={preview}
        postId={post?.databaseId}
        isRevision={post?.isPreview}
      >
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1>{post?.title}</h1>
              <div
                dangerouslySetInnerHTML={{ __html: post?.content }}
              />
            </div>
          </div>
        </div>
      </LayoutDefault>
    </GlobalsProvider>
  );
}

function PostsIndexPage(props) {
  return (
    <GlobalsProvider globals={props.globals}>
      <LayoutDefault title="" preview={props.preview}>
        <section className="pt-3 pb-3">
          <div className="container">
            <PostArchive {...props} />
          </div>
        </section>
      </LayoutDefault>
    </GlobalsProvider>
  );
}

function Blog(props) {
  const router = useRouter();
  const { query } = router;

  // If query has a slug in the url, other than `page` show the single template. else show the single.
  if (
    query &&
    Object.keys(query).length !== 0 &&
    query.slug &&
    query.slug[0] !== 'page'
  ) {
    return PostsSinglePage(props);
  } else {
    return PostsIndexPage(props);
  }
}

export async function getStaticProps(context) {
  let uri = '/posts/';

  if (context.params.slug?.length) {
    uri += context.params.slug.join('/');
  }
  //
  // Generate props for Post Index page
  //
  const globals = await getGlobalProps();

  // Check for redirects first
  const redirect = checkRedirects(
    uri,
    globals?.redirection?.redirects,
  );

  if (
    typeof redirect === 'object' &&
    redirect?.destination &&
    redirect?.statusCode
  ) {
    return { redirect: redirect };
  }

  const indexProps = await staticPropHelper(
    context,
    'POST',
    'post_type',
  );

  if (indexProps) {
    return {
      props: {
        ...indexProps,
        globals,
        preview: context.preview || false,
      },
      revalidate: 60,
    };
  }

  //
  // Generate props for Post Single Page
  //
  try {
    const { contentNode } = await getContent(
      `/posts/${context.params.slug[0]}`,
      context.preview,
      context.previewData,
    );

    return {
      props: {
        post: contentNode,
        globals,
        preview: context.preview || false,
      },
      revalidate: 60,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }

  //
  // No condition was met for this catch-all route, send 404
  //
  return {
    notFound: true,
    revalidate: 60,
    props: {},
  };
}

export async function getStaticPaths() {
  const paths = await staticPathGenerator('post_type');

  return {
    paths,
    fallback: 'blocking',
  };
}

export default Blog;
