const schedule = require('node-schedule');
const axios  = require('axios')
const moment = require('moment')
const dotenv = require('dotenv')
dotenv.config()

const LIST_OF_HOURS = [
    { id: 1, hour: "8", message: "Working" },
    { id: 2, hour: "9", message: "Working" },
    { id: 3, hour: "10", message: "Workingzz" },
    { id: 4, hour: "11", message: "Workingz" },
    { id: 5, hour: "12", message: "Rest" },
    { id: 6, hour: "13", message: "Working" },
    { id: 7, hour: "14", message: "Working" },
    { id: 8, hour: "15", message: "Working" },
    { id: 9, hour: "16", message: "Working" },
    { id: 10, hour: "17", message: "After hour" },
]

const runDiscordFunction = async () => {
    for (let i = 0; i < LIST_OF_HOURS.length; i++) {
        const hour = LIST_OF_HOURS[i]
        const date = new Date()
        const currentHour = moment(date).format('HH')
        if (hour.hour === currentHour) {
            const response = await setDiscordMessage(hour.message)
            console.log(response)
        }
        console.log("Function Done.")
    }
}

const setDiscordMessage = async (message) => {
    try {
        await axios.patch('https://discord.com/api/v9/users/@me/settings', {
            "custom_status": {
                "text": message,
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

schedule.scheduleJob('* * * * * *', async function(){
    console.log('its running.')
    await runDiscordFunction()
});