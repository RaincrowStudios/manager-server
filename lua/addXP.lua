local key_hash = KEYS[1]

local xpGain = ARGV[1]

local constants = redis.call('HMGET', 'constants', 'levelThresholds', 'baseEnergyByLevel', 'spellsByLevel')
local currentXP = redis.call('HINCRBY', key_hash, 'xp', xpGain)
local currentLevel = redis.call('HGET', key_hash, 'level')

local thresholds = cjson.decode(constants[1])
local baseEnergyByLevel = cjson.decode(constants[2])
local spellsByLevel = cjson.decode(constants[3])

if currentXP >= thresholds[currentLevel] then
  local level = currentLevel + 1
  redis.call('HMSET', key_hash, 'level', level, 'baseEnergy', baseEnergyByLevel[level], 'unlockedSpells', spellsByLevel[level])
  return currentXP, level, baseEnergyByLevel[level], spellsByLevel[level]
else
  return currentXP
end
