local instance = KEYS[1]

local energyChange = ARGV[1]

local exists = redis.call('EXISTS', instance)
if exists == 0 then
  return cjson.encode({0, 'dead'})
else
  local currentEnergy = redis.call('HINCRBY', instance, 'energy', energyChange)
  local baseEnergy = redis.call('HGET', instance, 'baseEnergy')

  local state = false

  if currentEnergy <= 0 then
    currentEnergy = 0
    state = 'dead'
    redis.call('HSET', instance, 'energy', currentEnergy)
  elseif currentEnergy >= baseEnergy * 5 then
    currentEnergy = baseEnergy * 5
    redis.call('HSET', instance, 'energy', currentEnergy)
  elseif currentEnergy/baseEnergy <= 0.2 then
    state = 'vulnerable'
  end

  redis.call('HSET', instance, 'state', cjson.encode(state))

  return cjson.encode({currentEnergy, state})
end
