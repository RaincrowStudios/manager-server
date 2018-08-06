local instance = KEYS[1]

local command = ARGV[1]
local field = ARGV[2]
local key = ARGV[3]
local newValue = cjson.decode(ARGV[4])

local exists = redis.call('EXISTS', instance)

if exists == 0 then
  return cjson.encode(false)
else
  local object = cjson.decode(redis.call('HGET', instance, field))

  if command == 'add' then
    object[key] = newValue
  elseif command == 'remove' then
    object[key] = nil
  else
    error("invalid command")
  end

  if table.getn(object) > 0 then
    redis.call('HSET', instance, field, cjson.encode(object))
    return cjson.encode(object)
  else
    redis.call('HSET', instance, field, '{}')
    return '{}'
  end
end
