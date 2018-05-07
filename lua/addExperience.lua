local key = KEYS[1]

local xpGain = ARGV[1]

local thresholds = cjson.decode(redis.call('HGET', 'list:constants', 'levelThresholds'))
local baseEnergyByLevel = cjson.decode(redis.call('HGET', 'list:constants', 'baseEnergyByLevel'))
local newXp = redis.call('HINCRBY', key, 'xp', xpGain)
local nextLevel = cjson.decode(redis.call('HGET', key, 'level')) + 1

if newXp >= thresholds[nextLevel] then
  redis.call('HMSET', key, 'level', cjson.encode(nextLevel), 'baseEnergy', cjson.encode(baseEnergyByLevel[nextLevel]))
  return cjson.encode({newXp, nextLevel})
else
  return cjson.encode({newXp, false})
end
