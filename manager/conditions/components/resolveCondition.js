module.exports = (range) => {
  if (range.includes('#')) {
    const [min, max]  = range.slice(1).split('-')

    const total = Math.floor(
      Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1)
    ) + parseInt(min, 10)

    return total
  }
  else {
    const [min, max] = range.split('-')

    const total = Math.floor(
      Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1)
    ) + parseInt(min, 10)

    return total * -1
  }
}
