local instance = KEYS[1]

local field = ARGV[1]
local value = ARGV[2]

local alive = redis.call('EXISTS', instance)

if alive == 0 then
  return cjson.encode(false)
else
  redis.call('HSET', instance, field, value)
  return cjson.encode(true)
end
