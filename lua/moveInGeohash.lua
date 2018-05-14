local category = KEYS[1]

local latitude = ARGV[1]
local longitude = ARGV[2]
local instance = ARGV[3]

local exists = redis.call('EXISTS', instance)

if exists == 0 then
  return cjson.encode(false)
else
  redis.call('GEOADD', category, longitude, latitude, instance)
  return cjson.encode(true)
end
