import path from 'path';
import {serial as test} from 'ava';
import AvaFiles from './';

test.afterEach(() => {
	// We changed the CWD in some of the tests.
	process.chdir(__dirname);
});

function fixture(...args) {
	args.unshift(__dirname, 'fixtr');
	return path.join(...args);
}

test('requires new', t => {
	const avaFiles = AvaFiles;
	t.throws(function () {
		avaFiles(['**/foo*']);
	}, 'Class constructor AvaFiles cannot be invoked without \'new\'');
});

test('ignores relativeness in patterns', t => {
	const avaFiles = new AvaFiles({files: ['./foo']});
	const file = avaFiles.files[0];

	t.is(file, 'foo');
});

test('testMatcher', t => {
	const avaFiles = new AvaFiles({files: ['**/foo*']});

	function isTest(file) {
		t.true(avaFiles.isTest(file), file + ' should be a test');
	}

	function notTest(file) {
		t.false(avaFiles.isTest(file), file + ' should not be a test');
	}

	isTest('foo-bar.js');
	isTest('foo.js');
	isTest('foo/blah.js');
	isTest('bar/foo.js');
	isTest('bar/foo-bar/baz/buz.js');
	notTest('bar/baz/buz.js');
	notTest('bar.js');
	notTest('bar/bar.js');
	notTest('_foo-bar.js');
	notTest('foo/_foo-bar.js');
	notTest('foo-bar.txt');
	notTest('node_modules/foo.js');
	notTest('fixtures/foo.js');
	notTest('helpers/foo.js');
});

test('sourceMatcher - defaults', t => {
	const avaFiles = new AvaFiles({files: ['**/foo*']});

	function isSource(file) {
		t.true(avaFiles.isSource(file), file + ' should be a source');
	}

	function notSource(file) {
		t.false(avaFiles.isSource(file), file + ' should not be a source');
	}

	isSource('foo-bar.js');
	isSource('foo.js');
	isSource('foo/blah.js');
	isSource('bar/foo.js');

	isSource('_foo-bar.js');
	isSource('foo/_foo-bar.js');
	isSource('fixtures/foo.js');
	isSource('helpers/foo.js');

	// TODO: Watcher should probably track any required file that matches the source pattern and has a require extension installed for the given extension.
	notSource('foo-bar.json');
	notSource('foo-bar.coffee');

	// These seem OK
	isSource('bar.js');
	isSource('bar/bar.js');
	notSource('node_modules/foo.js');
});

test('sourceMatcher - allow matching specific node_modules directories', t => {
	const avaFiles = new AvaFiles({
		files: ['**/foo*'],
		sources: ['node_modules/foo/**']
	});

	t.true(avaFiles.isSource('node_modules/foo/foo.js'));
	t.false(avaFiles.isSource('node_modules/bar/foo.js'));
});

test('sourceMatcher - providing negation patterns', t => {
	const avaFiles = new AvaFiles({
		files: ['**/foo*'],
		sources: ['!**/bar*']
	});

	t.false(avaFiles.isSource('node_modules/foo/foo.js'));
	t.false(avaFiles.isSource('bar.js'));
	t.false(avaFiles.isSource('foo/bar.js'));
});

test('findFiles - does not return duplicates of the same file', async t => {
	const avaFiles = new AvaFiles({files: ['**/no-duplicates/**']});

	const files = await avaFiles.findTestFiles();

	t.is(files.length, 2);
});

test('findFiles - honors cwd option', async t => {
	const avaFiles = new AvaFiles({
		files: ['**/test/*.js'],
		cwd: fixture('cwd', 'dir-b')
	});

	const files = await avaFiles.findTestFiles();

	t.is(files.length, 1);
	t.is(path.basename(files[0]), 'baz.js');
});

test('findFiles - finds the correct files by default', async t => {
	const fixtureDir = fixture('default-patterns');
	process.chdir(fixtureDir);

	const expected = [
		'sub/directory/__tests__/foo.js',
		'sub/directory/bar.test.js',
		'test-foo.js',
		'test.js',
		'test/baz.js',
		'test/deep/deep.js'
	].map(function (file) {
		return path.join(fixtureDir, file);
	}).sort();

	const avaFiles = new AvaFiles();

	const files = await avaFiles.findTestFiles();
	files.sort();
	t.deepEqual(files, expected);
});

test('findTestHelpers - finds the test helpers', async t => {
	const fixtureDir = fixture('default-patterns');
	process.chdir(fixtureDir);

	const expected = [
		'sub/directory/__tests__/helpers/foo.js',
		'sub/directory/__tests__/_foo.js',
		'test/helpers/test.js',
		'test/_foo-help.js'
	].sort().map(file => path.join(fixtureDir, file));

	const avaFiles = new AvaFiles();

	const files = await avaFiles.findTestHelpers();
	t.deepEqual(files.sort(), expected);
});
