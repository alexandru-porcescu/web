import * as firebase from '@firebase/testing';
import {
  initializeAdminApp,
  initializeFbApp,
  loadFirestoreRules,
  removeApps,
} from '../../helpers';

let admin: firebase.firestore.Firestore;
let db: firebase.firestore.Firestore;
let ref: firebase.firestore.CollectionReference;
const profile = {
  bio: 'bio',
  name: 'name',
  photo: 'user.png',
  username: 'username',
};

const data = {
  category: 'posts',
  comments: 0,
  content: 'content',
  cover: null,
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  createdBy: profile,
  createdById: 'currentUser',
  language: 'en',
  links: null,
  likes: 0,
  title: 'new name',
  topics: ['topicId'],
  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedBy: profile,
  updatedById: 'currentUser',
};

beforeAll(async (done) => {
  admin = initializeAdminApp();
  db = initializeFbApp({ uid: 'currentUser' });
  ref = db.collection('posts');
  await loadFirestoreRules();
  await admin.doc('profile/currentUser').set(profile);
  await admin.doc('chapters/valid').set({ lessons: 5 });
  done();
});

afterAll(async (done) => {
  await removeApps();
  done();
});

test('authenticated can create an item', async (done) => {
  await firebase.assertSucceeds(ref.add(data));
  done();
});

test('anonymous cannot create an item', async (done) => {
  const app = initializeFbApp(undefined);
  const appRef = app.collection('posts');
  await firebase.assertFails(
    appRef.add({ ...data, createdById: null, updatedById: null }),
  );
  done();
});

test('category has a valid string', async (done) => {
  await firebase.assertSucceeds(ref.add({ ...data, category: 'books' }));
  await firebase.assertSucceeds(ref.add({ ...data, category: 'courses' }));
  await firebase.assertSucceeds(ref.add({ ...data, category: 'examples' }));
  await firebase.assertSucceeds(
    ref.add({ ...data, chapterId: 'valid', category: 'lessons', order: 1 }),
  );
  await firebase.assertSucceeds(ref.add({ ...data, category: 'posts' }));
  await firebase.assertSucceeds(ref.add({ ...data, category: 'questions' }));
  await firebase.assertSucceeds(ref.add({ ...data, category: 'references' }));
  await firebase.assertFails(ref.add({ ...data, category: 'other' }));
  done();
});

test('comments is set to 0', async (done) => {
  await firebase.assertFails(ref.add({ ...data, comments: 1 }));
  done();
});

test('content is a string', async (done) => {
  await firebase.assertFails(ref.add({ ...data, content: 123 }));
  await firebase.assertFails(ref.add({ ...data, content: true }));
  await firebase.assertFails(ref.add({ ...data, content: { 1: true } }));
  await firebase.assertFails(ref.add({ ...data, content: ['test'] }));
  await firebase.assertFails(ref.add({ ...data, content: null }));
  done();
});

test('createdAt has a valid timestamp', async (done) => {
  await firebase.assertFails(ref.add({ ...data, createdAt: '1452-10-01' }));
  await firebase.assertFails(ref.add({ ...data, createdAt: new Date() }));
  done();
});

test('createdBy has a valid user bio', async (done) => {
  const createdBy = { ...profile, bio: 'invalid' };
  await firebase.assertFails(ref.add({ ...data, createdBy }));
  done();
});

test('createdBy has a valid user name', async (done) => {
  const createdBy = { ...profile, name: 'invalid' };
  await firebase.assertFails(ref.add({ ...data, createdBy }));
  done();
});

test('createdBy has a valid user photo', async (done) => {
  const createdBy = { ...profile, photo: 'invalid' };
  await firebase.assertFails(ref.add({ ...data, createdBy }));
  done();
});

test('createdBy has a valid username', async (done) => {
  const createdBy = { ...profile, username: 'invalid' };
  await firebase.assertFails(ref.add({ ...data, createdBy }));
  done();
});

test('createdById has the current user UID', async (done) => {
  await firebase.assertFails(ref.add({ ...data, createdById: 'other' }));
  done();
});

test('editors are not included', async (done) => {
  await firebase.assertFails(ref.add({ ...data, editors: [] }));
  done();
});

test('editorsData is not included', async (done) => {
  await firebase.assertFails(ref.add({ ...data, editorsData: {} }));
  done();
});

test('language has a valid string', async (done) => {
  await firebase.assertSucceeds(ref.add({ ...data, language: 'pt' }));
  await firebase.assertFails(ref.add({ ...data, language: 'other' }));
  done();
});

test('likes is set to 0', async (done) => {
  await firebase.assertFails(ref.add({ ...data, likes: 1 }));
  done();
});

test('links is an array', async (done) => {
  await firebase.assertSucceeds(ref.add({ ...data, links: [] }));
  await firebase.assertFails(ref.add({ ...data, links: 'test' }));
  await firebase.assertFails(ref.add({ ...data, links: 123 }));
  await firebase.assertFails(ref.add({ ...data, links: true }));
  await firebase.assertFails(ref.add({ ...data, links: { 1: true } }));
  done();
});

test('links is an array of strings or null', async (done) => {
  await firebase.assertSucceeds(ref.add({ ...data, links: ['url'] }));
  await firebase.assertFails(ref.add({ ...data, links: [true] }));
  await firebase.assertFails(ref.add({ ...data, links: [123] }));
  await firebase.assertFails(ref.add({ ...data, links: [null] }));
  await firebase.assertFails(ref.add({ ...data, links: [{ 1: true }] }));
  done();
});

test('links can be null', async (done) => {
  await firebase.assertSucceeds(ref.add({ ...data, links: null }));
  done();
});

test('title is a string', async (done) => {
  await firebase.assertFails(ref.add({ ...data, title: 123 }));
  await firebase.assertFails(ref.add({ ...data, title: true }));
  await firebase.assertFails(ref.add({ ...data, title: { 1: true } }));
  await firebase.assertFails(ref.add({ ...data, title: ['test'] }));
  await firebase.assertFails(ref.add({ ...data, title: null }));
  done();
});

test('topics is an array', async (done) => {
  await firebase.assertFails(ref.add({ ...data, topics: 'test' }));
  await firebase.assertFails(ref.add({ ...data, topics: 123 }));
  await firebase.assertFails(ref.add({ ...data, topics: true }));
  await firebase.assertFails(ref.add({ ...data, topics: { 1: true } }));
  await firebase.assertFails(ref.add({ ...data, topics: null }));
  done();
});

test('topics is an array of strings', async (done) => {
  await firebase.assertFails(ref.add({ ...data, topics: [true] }));
  await firebase.assertFails(ref.add({ ...data, topics: [123] }));
  await firebase.assertFails(ref.add({ ...data, topics: [null] }));
  await firebase.assertFails(ref.add({ ...data, topics: [{ 1: true }] }));
  done();
});

test('updatedAt has a valid timestamp', async (done) => {
  await firebase.assertFails(ref.add({ ...data, updatedAt: '1452-10-01' }));
  await firebase.assertFails(ref.add({ ...data, updatedAt: new Date() }));
  done();
});

test('updatedBy has a valid user bio', async (done) => {
  const updatedBy = { ...profile, bio: 'invalid' };
  await firebase.assertFails(ref.add({ ...data, updatedBy }));
  done();
});

test('updatedBy has a valid user name', async (done) => {
  const updatedBy = { ...profile, name: 'invalid' };
  await firebase.assertFails(ref.add({ ...data, updatedBy }));
  done();
});

test('updatedBy has a valid user photo', async (done) => {
  const updatedBy = { ...profile, photo: 'invalid' };
  await firebase.assertFails(ref.add({ ...data, updatedBy }));
  done();
});

test('updatedBy has a valid username', async (done) => {
  const updatedBy = { ...profile, username: 'invalid' };
  await firebase.assertFails(ref.add({ ...data, updatedBy }));
  done();
});

test('updatedById has the current user UID', async (done) => {
  await firebase.assertFails(ref.add({ ...data, updatedById: 'other' }));
  done();
});
