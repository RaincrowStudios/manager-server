local instance = KEYS[1]

local energyChange = ARGV[1]

local currentEnergy = redis.call('HINCRBY', instance, 'energy', energyChange)
local baseEnergy = redis.call('HGET', instance, 'baseEnergy')

if currentEnergy <= 0 then
  redis.call('HSET', instance, 'status', cjson.encode('dead'))
  redis.call('HSET', instance, 'energy', 0)
elseif currentEnergy/baseEnergy <= 0.2 then
  redis.call('HSET', instance, 'status', cjson.encode('vulnerable'))
else
  redis.call('HSET', instance, 'status', cjson.encode(false))
end

return cjson.encode(currentEnergy)
