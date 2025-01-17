import axios from 'axios';

const deleteSubscriptions = async () => {
  const twitchClientId = process.env.TWITCH_CLIENT_ID;
  const twitchAppToken = process.env.TWITCH_APP_TOKEN;

  const response = await axios.get('https://api.twitch.tv/helix/eventsub/subscriptions', {
    headers: {
      Authorization: `Bearer ${twitchAppToken}`,
      'Client-Id': twitchClientId,
    },
  });

  for (const suscription of response.data.data) {
    await axios.delete('https://api.twitch.tv/helix/eventsub/subscriptions', {
      params: { id: suscription.id },
      headers: {
        Authorization: `Bearer ${twitchAppToken}`,
        'Client-Id': twitchClientId,
      },
    });
  }
};

deleteSubscriptions();
