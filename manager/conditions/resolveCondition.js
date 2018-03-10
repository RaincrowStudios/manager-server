module.exports = (condition) => {
  if (condition.overTime.includes('#')) {
    const range = condition.overTime.slice(1).split('-')
    const min = parseInt(range[0], 10)
    const max = parseInt(range[1], 10)

    const total = Math.floor(Math.random() * (max - min + 1)) + min

    return total
  }
  else {
    const range = condition.overTime.split('-')
    const min = parseInt(range[0], 10)
    const max = parseInt(range[1], 10)

    const total = Math.floor(Math.random() * (max - min + 1)) + min

    return total * -1
  }
}
