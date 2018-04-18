local key = KEYS[1]

local command = ARGV[1]
local field = ARGV[2]
local newValue = cjson.decode(ARGV[3])
local index = ARGV[4] + 1

local alive = redis.call('EXISTS', key)

if alive == 0 then
  return cjson.encode(false)
else
  local array = cjson.decode(redis.call('HGET', key, field))

  if command == 'add' then
    table.insert(array, newValue)
  elseif command == 'remove' then
    table.remove(array, index)
  elseif command == 'replace' then
    array[index] = newValue
  else
    error("invalid command")
  end

  if table.getn(array) > 0 then
    redis.call('HSET', key, field, cjson.encode(array))
    return cjson.encode(array)
  else
    redis.call('HSET', key, field, '[]')
    return '[]'
  end
end
