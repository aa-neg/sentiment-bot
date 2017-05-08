const https = require ('https');
const querystring = require('querystring');
const request = require('./requestHelpers.js');
const botToken = process.env.SLACK_BOT_TOKEN

process.env.TZ = 'Australia/Sydney';

const slackApiPath = 'slack.com';
const postMessagePath = '/api/chat.postMessage';
const getUserListPath = '/api/users.list';
const imListPath = '/api/im.list';
const imOpenPath = '/api/im.open'

function getUserList() {
    return new Promise(function(resolve ,reject){
        const options = {
            hostname: slackApiPath,
            path: getUserListPath
        };

        const body = {
            "token": botToken
        };

        request.post(options, body)
            .then(function(res){
                resolve(res.data.members);
            })
            .catch(function(err) {
                reject(err);
            })
    })
};

function getIMchannelList() {
    return new Promise(function(resolve, reject) {
        const options = {
            hostname: slackApiPath,
            path: imListPath
        };

        const body = {
            token: botToken
        };

        request.post(options, body)
            .then(function(res) {
                resolve(res.data.ims);
            })
            .catch(function(err){
                reject(err);
            })
    })
}

function openChannel(user) {
    return new Promise(function(resolve ,reject) {
        const options = {
            hostname: slackApiPath,
            path: '/api/im.open'
        }

        const body = {
            token: botToken,
            user: user,
            return_im : true
        }

        request.post(options,body)
            .then(function(res) {
                resolve(res.data);
            })
            .catch(function(err) {
                reject(err);
            })
    })
}

function paddDate(date) {
    if (date.length < 2) {
        return '0' + date;
    }
    return date;
}

function createTemplate() {

    let currentDate = new Date();

    const dateKey = paddDate(currentDate.getDate().toString()) + paddDate(currentDate.getMonth().toString()) + currentDate.getFullYear().toString();

    let sentimentTemplate = [
                {
                    text: "How are you feeling?",
                    fallback: "You don't know how you feel?",
                    callback_id: dateKey,
                    color: "#3AA3E3",
                    attachment_type: "default",
                    actions: [
                        {
                            name: "sentiment",
                            text: "miserable",
                            type: "button",
                            value: 1 
                        },
                        {
                            name: "sentiment",
                            text: "poor",
                            type: "button",
                            value: 2 
                        },
                        {
                            name: "sentiment",
                            text: "so-so",
                            type: "button",
                            value: 3 
                        },
                        {
                            name: "sentiment",
                            text: "good",
                            type: "button",
                            value: 4 
                        },
                        {
                            name: "sentiment",
                            text: "excellent",
                            type: "button",
                            value: 5 
                        }
                    ]
                }
            ]

    return sentimentTemplate;
}

function postMessage(textMessage, channel) {
    return new Promise(function(resolve, reject) {
        const options = {
            hostname: slackApiPath,
            path: '/api/chat.postMessage'
        }

        const body = {
            token: botToken,
            channel: channel,
            text: textMessage,
            as_user: true,
            attachments: JSON.stringify(createTemplate())
        }

        request.post(options, body)
            .then(function(res) {
                resolve(res.data);
            })
            .catch(function(err) {
                reject(err);
            })
    })
}



function testInit() {
    return new Promise(function(resolve ,reject) {
        return getUserList()
            .then(function(userList) {
                return openChannel('U41LE35LN')
            })
            .then(()=> {
                return getIMchannelList()
            })
            .then(function(channels) {
                channels.forEach(function(channel) {
                    if (channel.user !== 'USLACKBOT') {
                        postMessage('hello there!', channel.id)
                    }
                })
            })
    })

    // console.log('starting.');
    // getUserList()
        // .then(function(list) {
            // //console.log(list);
            // let counter = 0;
            // list.members.forEach(function(member) {

                // if (member.name == 'arnold') {
                    // console.log(member);

                // }
                // counter += 1;
                // if (counter <= 1) {
                    // console.log(member);
               // }
            // })
        // })
    // getIMchannelList()
        // .then(function(data) {
            // data.ims.forEach(function(channel) {
                // console.log(channel)
            // })
        // });
}

exports.handler = (event, context, callback) => {
    console.log('About to start posting messages.');
    testInit()
        .then(function() {
            console.log('Completed.');
            callback();
        })
        .catch(function(err){
            console.log('Failed to post messages.');
            callback(err);
        })
}
