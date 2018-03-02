'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

app.set('port', (process.env.PORT || 5000))

// Allows us to process the data
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())


let APIAI_TOKEN = "760b473de6e7408cbfa5a893258d8cb8"
let APIAI_SESSION_ID = "manish"

let token = "EAAeEUf6U8mMBAITBtRhlLUzUrmQ2foucRY2AiO4ACIsdVEy55UNAZCxzkUC7ghtvvXNLmYKNpzuAaob5mTrZCNRwjAZAeViYWmnKl2lsr6vaKjRNaPf21EPR4PZB4Dvk3UC1KpMaRNWo9i9Sz32PabYmZBxPJNAfqkwpnCsxcFgZDZD"



app.disable('etag')


const apiai = require('apiai')(APIAI_TOKEN)


// ROUTES

app.get('/', function (req, res) {
    res.send("Hi I am a chatbot")
})


// Facebook 
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === "blondiebytes") {
        res.send(req.query['hub.challenge'])
    }
    res.send("Wrong token")
})
// This will handle post request.
app.post('/webhook/', function (req, res) {
    
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i]
        // This is sender id
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            sendText(sender, text)
        }
    }
    res.sendStatus(200)
})

function sendText(sender, text) {
    // Get a reply from API.AI
    let apiaiReq = apiai.textRequest(text, {
        sessionId: APIAI_SESSION_ID
    });


    apiaiReq.on('response', (response) => {
        let aiText = response.result.fulfillment.speech;

        let messageData = {
            text: aiText
        }

        // This will send the rquest to facebook
        request({
            url: "https://graph.facebook.com/v2.6/me/messages",
            qs: {
                access_token: token
            },
            method: "POST",
            json: {
                recipient: {
                    id: sender
                },
                message: messageData,
            }
        }, function (error, response, body) {
            if (error) {
                // in case there is some error while making the call.
                console.log("sending error")
            } else if (response.body.error) {
                // If in case there is error in response body
                console.log("response body error")
            }
        })

    });

    apiaiReq.on('error', (error) => {
        console.log(error)
    });

    apiaiReq.end()

}

app.listen(app.get('port'), function () {
    console.log("running: port")
})