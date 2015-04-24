var db_api = require('../../database');
var should = require('chai').should();
var assert = require('assert');
describe('Testing Lectures collection:', function() {
    this.timeout(10000);
    var testCourse = null;
    before(function(done) {
        db_api.course.dropCoursesDatabase(function() {
            db_api.course.createCourse('CS', 'CS121', 'Intro to CS', 'Fall', '2015', 'Tim', function(err, course) {
                testCourse = course;
                assert.equal(err, null);
                assert.notEqual(testCourse, null);
                assert.equal(testCourse.semester, 'Fall');
                assert.equal(testCourse.department, 'CS');
                assert.equal(testCourse.courseNumber, 'CS121');
                done();
            });
        });
    });
    var testUser = null;
    before(function(done) {
        db_api.user.dropUserDatabase(function() {
            db_api.user.createUser('test@test.com', 'password', 'first', 'last', 'role', function(err, doc) {
                testUser = doc;
                assert.equal(err, null);
                assert.notEqual(testUser, null);
                assert.equal(testUser.email, 'test@test.com');
                assert.equal(testUser.password, 'password');
                assert.equal(testUser.name.first, 'first');
                assert.equal(testUser.name.last, 'last');
                assert.equal(testUser.role, 'role');
                done();
            });
        });
    });
    var testLecture = null;
    before(function(done) {
        db_api.lecture.dropLecturesDatabase(function() {
            db_api.lecture.createLecture(testCourse, new Date().getDate(), "thisvideo", true, function(err, lecture) {
                testLecture = lecture;
                assert.equal(err, null);
                assert.notEqual(lecture, null);
                assert.equal(lecture.video, "thisvideo");
                assert.equal(lecture.visible, true);
                done();
            });
        });
    });
    /*
     * Tests that a lecture is added properly
     */
    it('add List of lectures', function(done) {
        db_api.course.addListOfLecturesById(testCourse._id, {}, function(err, lecture) {
            assert.equal(err, null);
            assert.notEqual(lecture, null);
            ///TODO
            done();
        });
    });
    /*
     * Tests that a lecture is retreived properly
     */
    it('retreives lecture by id', function(done) {
        db_api.lecture.getLectureById(testLecture._id, function(err, lecture) {
            assert.equal(err, null);
            assert.notEqual(lecture, null);
            lecture._id.should.eql(testLecture._id);
            done();
        });
    });
    /*
     * Test that a comment gets added to a lecture
     */
    var testComment = null;
    it('test that creates a comment', function(done) {
        db_api.comment.createComment(testLecture._id, testUser._id, "Lorem Ipsum dolor sit amet, consectetur adipiscing", new Date().getDate(), function(err, comment) {
            testComment = comment;
            assert.equal(err, null);
            assert.notEqual(comment, null);
            assert.equal(comment.content, "Lorem Ipsum dolor sit amet, consectetur adipiscing");
            assert.equal(comment.author, testUser._id);
            assert.equal(comment.lecture, testLecture._id);
            done();
        });
    });
    /*
     * Tests that a comment is added to the lecture properly
     */
    it('add comment to lecture: lectureID', function(done) {
        db_api.lecture.addCommentToLecture(testLecture._id, testComment, function(err, lecture) {
            assert.equal(err, null);
            assert.notEqual(lecture, null);
            assert.equal(lecture.comments[0], testComment._id);
            done();
        });
    });
    /*
     * Tests that an array of comments is being retreived properly
     */
    it('get comments from lecture', function(done) {
        db_api.lecture.getCommentsById(testLecture._id, function(err, comments) {
            assert.equal(err, null);
            assert.notEqual(comments, null);
            comments[0].lecture.should.eql( testLecture._id);
            done();
        });
    });
});