var formidable = require('formidable')
var fs = require('fs-extra');
var unzip = require('unzip');
var uuid = require('node-uuid');
var DecompressZip = require('decompress-zip');
var validator = require('validator');
var database = require("../../database/index.js");

//Lecture API
module.exports = {
    setup: function(router) {
        //Add a lecture to a course
        router.post('/:course_id/lecture', function(req,res) 
        {
            var course_id = req.params.course_id;

            if(!validator.isMongoId(course_id))
            {
                return res.sendFail("course_id parameter is not a valid MongoId");
            }
            /*
createLecture = function(course, date, video, visible, whiteboardImages, screenImages, callback) {
            */




            //Allows Formidable
            var form = new formidable.IncomingForm();

            /*Creates an event listener to print progress of upload to the console.
                Plan on sending progress data back to client eventually.
            */
            form.addListener('progress' , function(bytesRecieved , bytesExpected){
               
              console.log(((bytesRecieved) + "/" + bytesExpected) + " : " + ((bytesRecieved * 100)/bytesExpected) + "%");
            
            });


            form.parse(req, function(err, fields, files) 
            {
                if(files['upload'] == undefined)
                {
                    return res.sendFail("No file was provided");
                }

                var file = files['upload'];
                var tempPath = file['path'];

                console.log("Received upload. Placed in " + tempPath);

                if(fields['manual'] == 'true')
                {
                    console.log("Manual upload");

                    if(!fields['title'] || !fields['description']) 
                    {
                        res.sendFail("Invalid parameters");
                    }

                    if(file['type'] != "video/mp4")
                    {
                        res.sendFail("Video is not in mp4 format");
                    }


                    //Create a new random, unique, folder to save all unzipped lecture files
                    var videoPath = "media/" + req.params.course_id + "/" + uuid.v1() + "/video.mp4";

                    //Moves file from tmp to media
                    fs.move(tempPath, videoPath, function (err) 
                    {
                        if (err){
                            return res.sendFail(err);  
                        }

                        var date = (new Date());
                        console.log("DATE: " + date);

                        database.lecture.createLecture(course_id, fields['title'], fields['description'], date, videoPath, true, [], [], function(err, lecture)
                        {
                            if(err)
                                return res.sendFail(err);

                            resCourse = {};
                            resCourse.lecture_id = lecture._id;
                            resCourse.course_id = course_id;
                            resCourse.date = lecture.date;
                            resCourse.title = lecture.title;
                            resCourse.description = lecture.description;
                            resCourse.video_url = lecture.video;
                            resCourse.screen_image_urls = lecture.screenImages;
                            resCourse.whiteboard_image_urls = lecture.whiteboardImages;

                            return res.sendSuccess(resCourse);
                        });
                    })


                   



                }
                else{
                    console.log("Auto upload");

                    //Create a new random, unique, folder to save all unzipped lecture files
                    var unzipPath = "media/" + req.params.course_id + "/" + uuid.v1() + "/";

                    //Extracts files from temp zip file
                    //fs.createReadStream(tempPath).pipe(unzip.Extract({ path: unzipPath }))
                    var unzipper = new DecompressZip(tempPath);
                    
                    unzipper.on('error', function (error) {
                        /*On unzipping error, abort request. Doesn't work for all file types, such as .txt*/
                        console.log("File uploaded was not a .zip file. Aborting upload.");
                        console.log(error);
                        res.sendFail("Invalid File Type");
                        return;
                    });

                    unzipper.on('extract', function(end)
                    {   
                        /*Once completing the unzipping, read other params and respond*/

                        console.log("Unzipped files placed in " + unzipPath);      

                        //How to recieve other fields from a multipart POST request
                        var semester = fields['semester'];
                        var course = fields['course'];
                        var date = fields['date'];

                        console.log(semester + " : " + course + " : " + date + " --- " + unzipPath);

                        //Test response to prove it works

                        var resObject = {};
                        resObject.course_id = req.params.course_id;
                        resObject.lecture_id = "TODO";

                        res.sendSuccess(resObject);

                        res.write(semester + " : " + course + " : " + date + " --- " + unzipPath + "</br></br>");

                        res.end();
                    });

                    unzipper.on('progress', function (fileIndex, fileCount) {
                        console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
                    });

                    unzipper.extract({
                        path: unzipPath,
                        filter: function (file) {
                            return file.type !== "SymbolicLink";
                        }
                    });
                }
            });
        });

        //Get a specific lecture
        router.get('/:course_id/lecture/:lecture_id', function(req,res) {
            // if(req.params.course_id == undefined) {
            //     res.sendFail("No valid lecture_id parameter");
            // } else if(validator.isMongoId(req.params.lecture_id) == false) {   
            //     res.sendFail("Lecture ID is not a valid MongoID");
            // } else {
            //     database.course.lecture.getLectureById(req.params.lecture_id, function(err, lecture) {
            //         if(err) {
            //             res.sendFail(err);  
            //         } else {
            //             // TODO: send back course
            //             res.sendSuccess("Got Lecture"); 
            //         }
            //     });
            // }
        });

        //Edit a specific lecture
        router.put('/:course_id/lecture/:lecture_id', function(req,res) {
            // TODO no update db call?
        });

        //Delete a user from a course's roster
        router.delete('/:course_id/lecture/:lecture_id', function(req,res) {
            // TODO no delete user db call?
        });
    }
};
