const { google } = require('googleapis')
const compute = google.compute('beta')

module.exports = () => {
  return new Promise((resolve, reject) => {
    try {
      google.auth.getApplicationDefault((err, authClient) => {
        if (err) {
          throw new Error(err)
        }
        if (
          authClient.createScopedRequired &&
          authClient.createScopedRequired()
        ) {
          const scopes = ['https://www.googleapis.com/auth/cloud-platform']
          authClient = authClient.createScoped(scopes)
        }

        const request = {
          project: 'raincrow-pantheon',
          region: process.env.INSTANCE_REGION.split('/').pop().slice(0, -2),
          instanceGroupManager: process.env.NODE_ENV + '-manager-group-' +
            process.env.INSTANCE_REGION.split('/').pop().slice(0, -2),
          auth: authClient,
        }

        compute.regionInstanceGroupManagers.listManagedInstances(request,
          (err, response) => {
            if (err) {
              throw new Error(err)
            }
            else {
              const managedInstanceIds =
                response.data.managedInstances.map(instance => instance.id)

              resolve(managedInstanceIds)
            }
          }
        )
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
