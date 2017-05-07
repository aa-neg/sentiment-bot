const AWS = require('aws-sdk');
const queryString = require('querystring');

AWS.config.update({region:process.env.AWS_REGION});

function createBucket(bucketParams) {
    return new Promise(function(resolve ,reject) {
        s3.createBucket(bucketParams , function(err, data) {
            if (err) {
                console.log("Error creating bucket: ", err);
                reject(err);
            } else {
                resolve(data.Location);
            }
        })
    })
}

function uploadObject(uploadParams) {
    return new Promise(function(resolve ,reject) {
        s3.upload(uploadParams, function(err, data) {
            console.log('finished uploading object');
            console.log(err);
            console.log(data);
            if (err) {
                console.log("Error uploading to bucket: ", uploadParams.Bucket);
                reject(err);
            } else {
                resolve();
            }
        })
    })
}


function getSentiment(bucketParams) {
    return new Promise(function(resolve ,reject) {
        s3.getObject(bucketParams, function(err, data) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('Our json from the file!');
                console.log(JSON.parse(data.Body.toString('utf-8')));
                resolve();
            }
        });
    });

}

function deleteObject(params) {
    return new Promise(function(resolve ,reject) {
        s3.deleteObject(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

function generateResponse(err) {
    let responseMessage = "";

    // if (err) {
        // responseMessage = "Oops I couldn't save your response. I'll see what i can do. :(";
        
    // } else {
        // responseMessage = "Thanks! I'll go see how everyone else is feeling.";
    // }

    // console.log(responseMessage)

    // const response = {
        // statusCode: '200',
        // body: JSON.stringify(responseMessage),
        // headers: {
            // 'Content-Type': 'application/json'
        // }
    // }

    const response = {
        statusCode: '200',
        body: '',
        headers: {
            'Content-Type': 'application/json'
        }
    }

    console.log(response);

    return response;
}

function generateSentimentModel(details) {
    return {
        sentiment: details.actions[0],
        user: details.user,
        channel: details.channel
    }
}

function handleResponse(details) {
    s3 = new AWS.S3;
    const bucketName = "hypothesis.slack.sentimentalbot";

     return uploadObject({
        Bucket: bucketName,
        Key: details.callback_id,
        Body: JSON.stringify(generateSentimentModel(details))
    })
}


exports.handler = (event, context, callback) => {
    var requestDetails = JSON.parse(queryString.parse(event.body).payload);

    s3 = new AWS.S3;
    const bucketName = "hypothesis.slack.sentimentalbot";

    s3.upload(
        {
            Bucket: bucketName,
            Key: requestDetails.callback_id,
            Body: JSON.stringify(generateSentimentModel(requestDetails))
        }
        , function(err, data) {
            console.log("Finished uploading")
            if (err) {
                callback(null, generateResponse(err))
            } else {
                callback(null, generateResponse);
            }
    })

    // callback(null, generateResponse())

    
    // handleResponse(requestDetails)
        // .then(function(){
            // console.log("successfully uploaded response.");
            // let response = generateResponse();

            // callback(null, response);
        // })
        // .catch(function(){
            // console.log("Failed to handle response: ", err);
            // let response = generateResponse(err);
            // callback(null, response);
        // })

}
