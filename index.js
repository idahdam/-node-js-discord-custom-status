const schedule = require('node-schedule');
const axios  = require('axios')
const moment = require('moment')
const dotenv = require('dotenv')
dotenv.config()

moment.locale('id') // this is for indonesian time zone

const DISCORD_API_BASE_URL = process.env.DISCORD_API_BASE_URL
const DISCORD_API_GUILD_ID = process.env.DISCORD_API_GUILD_ID

var running = false // this is for prevent multiple running
var earliest_time = moment({hour: 10, minute: 0, second: 0}); // this might be replaced by cronjob function
var latest_time = moment({hour: 16, minute: 0, second: 0}); // this might be replaced by cronjob function
var finalMessage = ""
var tempChecker = ""

const OUTSIDE_HOUR_MAP = {
    before: {
        text: "Before Working hour 🥱",
        checker: "before_hour"
    },
    after: {
        text: "After hour 😴",
        checker: "after_hour"
    },
    noExist: {
        text: "No Event Exist. 🤔",
        checker: "no_event_exist"
    }
}

const runDiscordFunction = async () => {

    const hitEventList = 
        await axios.get(`${DISCORD_API_BASE_URL}/guilds/${DISCORD_API_GUILD_ID}/scheduled-events?${process.env.DISCORD_API_GUILD_PARAMS}`, {
            headers: {
                'Authorization': process.env.AUTHORIZATION_TOKEN,
                'Content-Type': 'application/json'
            }
        })
    
    const date = new Date()
    const currentTime = moment(date)

    if (hitEventList.data.length > 0) {

        // looping through event list
        for (var i = 0; i < hitEventList.data.length; i++) {
            const event = hitEventList.data[i]
            const eventStartTime = moment(event.scheduled_start_time)
            const eventEndTime = moment(event.scheduled_end_time)

            // set earliest time and latest time
            if (eventStartTime.hours() < earliest_time.hours()) {
                earliest_time = eventStartTime
                console.log("Earliest time changed to:", earliest_time.format('HH:mm'))
            }
            if (eventEndTime.hours() > latest_time.hours()) {
                latest_time = eventEndTime
                console.log("Latest time changed to:", latest_time.format('HH:mm'))
            }

            // check if event is in range change status
            if (currentTime >= eventStartTime && currentTime <= eventEndTime) {
                await setDiscordMessage(event.name, eventEndTime)
            } else if (moment().isBefore(earliest_time) && running == false && tempChecker != OUTSIDE_HOUR_MAP.before.checker) {
                // check if current time is before earliest time
                tempChecker = OUTSIDE_HOUR_MAP.before.checker
                await setDiscordMessage(tempChecker)
                running = true
            } else if (moment().isAfter(latest_time) && running == false && tempChecker != OUTSIDE_HOUR_MAP.after.checker) {
                // check if current time is after latest time
                tempChecker = OUTSIDE_HOUR_MAP.after.checker
                await setDiscordMessage(tempChecker)
                running = true
            } 
        }   
    } else {
        // if no event exist
        await setDiscordMessage(OUTSIDE_HOUR_MAP.noExist.checker)
    }
}

const setDiscordMessage = async (message, eventEndTime = moment("2022-02-02 08:00:00")) => {
    try {
        // final message template
        finalMessage = `${message}, until ${moment(eventEndTime).format('HH:mm')}`
        if (message == OUTSIDE_HOUR_MAP.after.checker) {
            finalMessage = OUTSIDE_HOUR_MAP.after.text
        } else if (message == OUTSIDE_HOUR_MAP.before.checker) {
            finalMessage = OUTSIDE_HOUR_MAP.before.text
        } else if (message == OUTSIDE_HOUR_MAP.noExist.checker) {
            finalMessage = OUTSIDE_HOUR_MAP.noExist.text
        } 
        console.log("Current message:", finalMessage);
        await axios.patch(`${DISCORD_API_BASE_URL}/users/@me/settings`, {
            "custom_status": {
                "text": finalMessage,
            },
        }, {
            headers: {
                'Authorization': process.env.AUTHORIZATION_TOKEN,
                'Content-Type': 'application/json'
            }
        })
        return "true"
    } catch (error) {
        return error
    }
}

schedule.scheduleJob('* * * * *', async function(){
    console.log('its running at: ', moment().format('HH:mm:ss'))
    running = false
    if (!running) {
        await runDiscordFunction()
    }
});