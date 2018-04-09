local instance = KEYS[1]

local energyChange = ARGV[1]

local currentEnergy = redis.call('HINCRBY', instance, 'energy', energyChange)

if currentEnergy <= 0 then
  redis.call('HSET', instance, 'dead', cjson.encode(true))
end

return cjson.encode({currentEnergy})
