import axios from 'axios';

const listSubscriptions = async () => {
  const twitchClientId = process.env.TWITCH_CLIENT_ID;
  const twitchAppToken = process.env.TWITCH_APP_TOKEN;

  const config = {
    headers: {
      Authorization: `Bearer ${twitchAppToken}`,
      'Client-Id': twitchClientId,
    },
  };

  const response = await axios.get('https://api.twitch.tv/helix/eventsub/subscriptions', config);

  console.log(response.data);
};

listSubscriptions();
