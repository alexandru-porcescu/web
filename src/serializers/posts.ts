import { Post } from '@zoonk/models';
import { serializeFirebaseDate } from './date';
import { serializeLinkCollection } from './link';

/**
 * Serialize a single post.
 */
export const serializePost = (
  snap: firebase.firestore.DocumentSnapshot<Post.Response>,
): Post.Get => {
  const data = snap.data()!;
  const editors = data.editors || [];
  const editorsData = data.editorsData || {};

  return {
    ...data,
    createdAt: serializeFirebaseDate(data.createdAt),
    editors: editors.map((editor) => ({
      ...editorsData[editor],
      id: editor,
    })),
    editorsData,
    id: snap.id,
    links: data.links ? data.links.filter(Boolean) : null,
    sites: serializeLinkCollection(data.links),
    updatedAt: serializeFirebaseDate(data.updatedAt),
  };
};
