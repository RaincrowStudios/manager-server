module.exports = (conditions, status) => {
  if (!conditions || !Object.keys(conditions).length) {
    return false
  } else {
    const hasStatus = Object.values(conditions).filter(
      condition => condition.status === status
    ).length
    return hasStatus ? true : false
  }
}
