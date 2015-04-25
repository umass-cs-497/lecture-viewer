var Lecture = require('./models/lecture');
/*
  Methods to work with Lecture database.
  For getter methods, callback should be in the form function(err, data).
 */
exports.getCommentsById = function(lectureID, callback) {
    Lecture.findById(lectureID).populate('comments').exec(function(err, lecture) {
        if (err) callback(err);
        else if (!lecture) callback("lectureID does not exist.");
        else callback(undefined, lecture.comments);
    });
};
exports.getLectureById = function(lectureId, callback) {
    Lecture.findById(lectureId, function(err, lecture) {
        if (err) {
            callback(err);
        } else if (!lecture) {
            callback("lectureID does not exist");
        } else {
            callback(undefined, lecture);
        }
    });
};
/*
 * setLectureVisibility: sets the visibility of a lecture.
 */
exports.setLectureVisibilityById = function(lectureId, visibility, callback) {
    Lecture.findByIdAndUpdate(lectureId, {
        visible: visibility
    }, callback);
};
/*
 * getLectureVisibility: gets the visibility of a lecture
 */
exports.getLectureVisibilityById = function(lectureId, callback) {
    Lecture.findById(lectureId, function(err, lecture) {
        if (err) {
            callback(err);
        } else if (!lecture) {
            callback("Lecture not found");
        } else {
            callback(undefined, lecture.visible);
        }
    });
};
/*
 * Adds a comment to a lecture
 */
exports.addCommentToLecture = function(lectureId, comment, callback) {
    Lecture.findById(lectureId, function(err, lecture) {
        if (err) callback(err);
        else if (!lecture) callback("no lecture found");
        else {
            lecture.comments.push(comment);
            lecture.save(function(err) {
                if (err) callback(err);
                else callback(undefined, lecture);
            });
        }
    });
};
/*
 * This method creates a lecture linked to a course
 */
exports.createLecture = function(course, date, video, visible, whiteboardImages, screenImages, callback) {
    Lecture.find({
        course: course,
        date: date,
        video: video
    }, function(err, lecture) {
        if (err) {
            callback(err);
        } else if (!lecture) {
            callback("lecture already exist");
        } else {
            Lecture.create({
                course: course,
                date: date,
                video: video,
                whiteboardImages: whiteboardImages,
                screenImages: screenImages,
                visible: visible
            }, function(err, lecture) {
                callback(err, lecture);
            });
        }
    });
};
/*
 * Deletes Lecture database
 */
exports.dropLecturesDatabase = function(callback) {
    Lecture.remove({}, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Lecture database dropped");
        }
        callback();
    });
};
/*
 * updates a given lecture
 */
exports.updateLectureByID = function(lecture_id, course, date, video, visible, whiteboardImages, screenImages, callback) {
    Lecture.findByIdAndUpdate(lecture_id, {
        $set: {
            course: course,
            date: date,
            video: video,
            whiteboardImages: whiteboardImages,
            screenImages: screenImages,
            visible: visible
        }
    }, function(err, lecture){
        if (err){
            callback(err);
        }else if(!lecture){
            callback("lecture does not exist");
        }else{
            callback();
        }
    });
};