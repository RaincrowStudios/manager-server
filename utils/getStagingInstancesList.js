const { google } = require('googleapis')
const compute = google.compute('beta')

authorize(function(authClient) {
  const request = {
    project: 'raincrow-pantheon',
    zone: process.env.INSTANCE_REGION.split('/').pop(),
    instanceGroup: 'staging-manager-group',
    resource: {},
    auth: authClient,
  }

  var handlePage = function(err, response) {
    if (err) {
      console.error(err)
      return
    }

    const itemsPage = response['items']
    if (!itemsPage) {
      return
    }
    for (let i = 0; i < itemsPage.length; i++) {
      //Change code below to process each resource in `itemsPage`:
      console.log(JSON.stringify(itemsPage[i], null, 2))
    }

    if (response.nextPageToken) {
      request.pageToken = response.nextPageToken
      compute.instanceGroups.listInstances(request, handlePage)
    }
  }

  compute.instanceGroups.listInstances(request, handlePage)
})

function authorize(callback) {
  google.auth.getApplicationDefault(function(err, authClient) {
    if (err) {
      console.error('authentication failed: ', err)
      return
    }
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      const scopes = ['https://www.googleapis.com/auth/cloud-platform']
      authClient = authClient.createScoped(scopes)
    }
    callback(authClient)
  })
}
