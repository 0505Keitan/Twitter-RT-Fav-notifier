require('dotenv').config();
const twitter = require('twitter');
const moment = require('moment');
const cron = require('node-cron');
const axios = require('axios');
cron.schedule('* * * * *', () => getRTandFav());

const client = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

let rt = 0;
let fav = 0;

const getRTandFav = () => {
  client.get('statuses/show', {id: process.env.TWEET_ID}, function(error, res, response) {
    if(!error){
      let msg =`${moment().format('YYYY/MM/DD HH:mm:ss')}\nリツイート数：${String(res.retweet_count.toLocaleString())}\nいいね数：${String(res.favorite_count.toLocaleString())}\n\n1分前との差\nリツイート数：${String(res.retweet_count-rt)}\nいいね数：${String(res.favorite_count-fav)}\n----------------`;
      console.log(msg);
      axios({
        method: 'post',
        url: `https://discordapp.com/api/webhooks/${process.env.DISCORD_WEBHOOK}`,
        headers: {'Content-type': 'application/json'},
        data: {
          username: 'Twitter',
          content: msg
        }
      })

      axios({
        method: 'post',
        url: `https://script.google.com/macros/s/${process.env.GAS_API}/exec`,
        headers: {'Content-type': 'application/json'},
        data: {time: moment().format('YYYY/MM/DD HH:mm:ss'), rt: res.retweet_count.toLocaleString(), fav: res.favorite_count.toLocaleString()}
      })
    
      rt = res.retweet_count;
      fav = res.favorite_count;
    }else{
      console.log(error);
    }
  });
}