local instance = KEYS[1]

local energyChange = ARGV[1]

local currentEnergy = redis.call('HINCRBY', instance, 'energy', energyChange)
local baseEnergy = redis.call('HGET', instance, 'baseEnergy')

local status = false

if currentEnergy <= 0 then
  currentEnergy = 0
  status = 'dead'
  redis.call('HSET', instance, 'energy', currentEnergy)
elseif currentEnergy/baseEnergy <= 0.2 then
  status = 'vulnerable'
end

redis.call('HSET', instance, 'status', cjson.encode(status))

return cjson.encode({currentEnergy, status})
