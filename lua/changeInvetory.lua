local key_geo = KEYS[1]
local key_hash = KEYS[2]

local field = ARGV[1]
local newValue = ARGV[2]

local oldValue = redis.call('GEORADIUS', key_geo, longitude, latitude, 10, 'km')

return redis.call('HSET', key_hash, unpack(city_ids))
