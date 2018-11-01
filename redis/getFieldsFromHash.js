const selectRedisClient = require("./selectRedisClient");

module.exports = (instance, fields) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!instance || typeof instance !== "string") {
        throw new Error("Invalid instance: " + instance);
      } else if (!fields || !Array.isArray(fields)) {
        throw new Error("Invalid fields: " + fields);
      }

      const client = await selectRedisClient(instance);

      client.hmget([instance, ...fields], (err, results) => {
        if (err) {
          throw new Error("5300");
        }
        const object = {};
        for (let i = 0; i < fields.length; i++) {
          const result = JSON.parse(results[i]);
          if (result !== null || result !== undefined) {
            object[fields[i]] = result;
          }
        }
        resolve(object);
      });
    } catch (err) {
      reject(err);
    }
  });
};
