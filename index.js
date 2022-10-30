const schedule = require('node-schedule');
const axios  = require('axios')
const moment = require('moment')
const dotenv = require('dotenv')
dotenv.config()

moment.locale('id') // this is for indonesian time zone

const DISCORD_API_BASE_URL = process.env.DISCORD_API_BASE_URL
const DISCORD_API_GUILD_ID = process.env.DISCORD_API_GUILD_ID

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
        for (var i = 0; i < hitEventList.data.length; i++) {
            const event = hitEventList.data[i]
            const eventStartTime = moment(event.scheduled_start_time)
            const eventEndTime = moment(event.scheduled_end_time)
            if (currentTime >= eventStartTime && currentTime <= eventEndTime) {
                await setDiscordMessage(event.name, eventEndTime)
            }
        }   
    } else {
        await setDiscordMessage("After hour")
    }
}

const setDiscordMessage = async (message, eventEndTime = moment("2022-02-02 08:00:00")) => {
    try {
        let finalMessage = `${message}, until ${moment(eventEndTime).format('HH:mm')}`
        if (message == "After hour") {
            finalMessage = "After hour 😴"
        }
        await axios.patch('https://discord.com/api/v9/users/@me/settings', {
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

schedule.scheduleJob('*/5 * * * *', async function(){
    console.log('its running.')
    await runDiscordFunction()
});