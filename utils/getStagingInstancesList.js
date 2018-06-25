const { google } = require('googleapis')
const compute = google.compute('beta')

async function authorize(callback) {
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
  return new Promise(async (resolve, reject) => {
    try {
      authorize(async (authClient) => {
        const request = {
          project: 'raincrow-pantheon',
          zone: process.env.INSTANCE_REGION.split('/').pop(),
          instanceGroup: 'staging-manager-group',
          resource: {},
          auth: authClient,
        }

        const handlePage = async (err, response) => {
          if (err) {
            console.error(err)
            throw new Error(err)
          }
          console.log(response.data)
          const itemsPage = response['items']
          console.log(itemsPage)
          if (!itemsPage) {
            resolve(false)
          }
          for (let i = 0; i < itemsPage.length; i++) {
            //Change code below to process each resource in `itemsPage`:
            console.log(JSON.stringify(itemsPage[i], null, 2))
          }

          if (response.nextPageToken) {
            request.pageToken = response.nextPageToken
            await compute.instanceGroups.listInstances(request, handlePage)
          }
        }

        await compute.instanceGroups.listInstances(request, handlePage)
      })

      resolve('Done')
    }
    catch (err) {
      reject(err)
    }
  })
}
