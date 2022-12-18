const axios = require("axios");
const moment = require("moment");
const dotenv = require("dotenv");

const sendScheduleOfTheDay = async (events) => {
  try {
    if (events.data.length > 0) {
      var fields = [];
      for (var i = 0; i < events.data.length; i++) {
        // check if date is today
        if (
          moment(events.data[i].scheduled_start_time).format("YYYY-MM-DD") ==
          moment().format("YYYY-MM-DD")
        ) {
          fields.push({
            name: events.data[i].name,
            value: `${moment(events.data[i].scheduled_start_time).format(
              "HH:mm"
            )} - ${moment(events.data[i].scheduled_end_time).format("HH:mm")}`,
          });
        }
      }

      if (fields.length == 0) {
        fields.push({
          name: "No schedule for today!",
          value: "Enjoy your day!",
        });
      }

      await axios.post(process.env.DISCORD_SCHEDULE_WEBHOOK_URL, {
        username: "Schedule Bot 📅",
        avatar_url: "https://i.imgur.com/4M34hi2.png",
        embeds: [
          {
            author: {
              name: "Ruby 🔮",
              url: "https://www.reddit.com/r/cats/",
              icon_url: "https://i.imgur.com/R66g1Pe.jpg",
            },
            title: "Here are your schedule for today!",
            description: "Make sure there are no overlaps! Have fun!",
            color: 15258703,
            fields: fields,
          },
        ],
      });

      console.log("Schedule sent!");
    }
  } catch (error) {
    console.log("Error during sending schedule of the day: " + error);
  }
};

module.exports = {
  sendScheduleOfTheDay,
};
