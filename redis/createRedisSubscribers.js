const ping = require("ping");
const redis = require("redis");
const production = require("../config/production");
const ips = require("../config/region-ips");
const subscribers = require("../database/subscribers");
const manager = require("../manager/manager");

module.exports = () => {
  return new Promise((resolve, reject) => {
    try {
      if (process.env.NODE_ENV === "development") {
        const subscriber = redis.createClient(6379, "localhost");

        subscriber.on("ready", () => {
          const subscriberToRemove = subscribers.by("subscriber", subscriber);

          if (typeof subscriberToRemove === "object") {
            subscribers.remove(subscriberToRemove);
          }

          subscribers.insert({ subscriber: subscriber });

          subscriber.subscribe("manager");
        });

        subscriber.on("message", (channel, message) => {
          const subscriberToRemove = subscribers.by("subscriber", subscriber);

          if (typeof subscriberToRemove === "object") {
            subscribers.remove(subscriberToRemove);
          }

          subscribers.insert({ subscriber: subscriber });

          manager(JSON.parse(message));
        });

        subscriber.on("error", err => {
          throw new Error(err);
        });
      } else {
        Object.keys(ips).forEach(region => {
          const host = ips[region] + production.redisAddress;

          ping.sys.probe(host, isAlive => {
            if (isAlive) {
              const subscriber = redis.createClient(6379, host);

              subscriber.on("ready", () => {
                const subscriberToRemove = subscribers.by(
                  "subscriber",
                  subscriber
                );

                if (typeof subscriberToRemove === "object") {
                  subscribers.remove(subscriberToRemove);
                }

                subscribers.insert({ subscriber: subscriber });

                subscriber.subscribe("manager");
              });

              subscriber.on("message", (channel, message) => {
                manager(JSON.parse(message));
              });

              subscriber.on("error", err => {
                throw new Error(err);
              });
            }
          });
        });
      }
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
};
