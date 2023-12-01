import axios from 'axios';

const createSubscription = async () => {
  const twitchUserId = process.env.TWITCH_USER_ID;
  const twitchClientId = process.env.TWITCH_CLIENT_ID;
  const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
  const twitchAppToken = process.env.TWITCH_APP_TOKEN;

  const data = {
    type: 'stream.online',
    version: '1',
    condition: { user_id: twitchUserId },
    transport: {
      method: 'webhook',
      callback: 'https://luisalejandro.org/api/twitch-events',
      secret: twitchClientSecret,
    },
  };
  const config = {
    headers: {
      Authorization: `Bearer ${twitchAppToken}`,
      'Client-Id': twitchClientId,
      'Content-Type': 'application/json',
    },
  };

  const response = await axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', data, config);

  console.log(response.data);
};

createSubscription();
