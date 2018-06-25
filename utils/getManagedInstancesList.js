const { google } = require('googleapis')
const compute = google.compute('beta')

function authorize(callback) {
  google.auth.getApplicationDefault((err, authClient) => {
    if (err) {
      console.error('authentication failed: ', err)
      return err
    }
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      const scopes = ['https://www.googleapis.com/auth/cloud-platform']
      authClient = authClient.createScoped(scopes)
    }
    callback(authClient)
  })
}

module.exports = () => {
  return new Promise((resolve, reject) => {
    try {
      authorize(async (authClient) => {
        const request = {
          project: 'raincrow-pantheon',
          region: process.env.INSTANCE_REGION.split('/').pop().slice(0, -2),
          instanceGroupManager: process.env.NODE_ENV + '-manager-group-' +
            process.env.INSTANCE_REGION.split('/').pop().slice(0, -2),
          auth: authClient,
        }

        const handlePage = (err, response) => {
          return new Promise((resolve, reject) => {
            try {
              if (err) {
                console.error(err)
                throw new Error(err)
              }
              console.log(response.data)
              const managedInstances = response.data['managedInstances']
              const managedInstanceIds =
                managedInstances.map(instance => instance.id)
              resolve(managedInstanceIds)
            }
            catch (err) {
              reject(err)
            }
          })
        }

        compute.regionInstanceGroupManagers.listManagedInstances(request, handlePage)
      })
    }
    catch (err) {
      reject(err)
    }
  })
}
