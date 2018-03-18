local key = KEYS[1]

local xpGain = ARGV[1]

local thresholds = cjson.decode(redis.call('HGET', 'hash:constants:all', 'levelThresholds'))
local baseEnergyByLevel = cjson.decode(redis.call('HGET', 'hash:constants:all', 'baseEnergyByLevel'))
local spellsByLevel = cjson.decode(redis.call('HGET', 'hash:constants:all', 'spellsByLevel'))
local newXP = redis.call('HINCRBY', key, 'xp', xpGain)
local nextLevel = cjson.decode(redis.call('HGET', key, 'level')) + 1

if newXP >= thresholds[nextLevel] then
  redis.call('HMSET', key, 'level', cjson.encode(nextLevel), 'baseEnergy', cjson.encode(baseEnergyByLevel[nextLevel]), 'unlockedSpells', cjson.encode(spellsByLevel[nextLevel]))
  return cjson.encode({newXP, nextLevel, baseEnergyByLevel[level], spellsByLevel[level]})
else
  return newXP
end
