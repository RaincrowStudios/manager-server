const { google } = require('googleapis')
const compute = google.compute('beta')

authorize(function(authClient) {
  const request = {
    project: 'raincrow-pantheon',
    region: process.env.INSTANCE_REGION.split('/').pop().slice(0, -2),
    instanceGroupManager: 'prod-manager-group-' +
      process.env.INSTANCE_REGION.split('/').pop().slice(0, -2),
    auth: authClient,
  }

  const handlePage = function(err, response) {
    if (err) {
      console.error(err)
      return err
    }

    var managedInstancesPage = response['managedInstances']
    if (!managedInstancesPage) {
      return
    }
    for (let i = 0; i < managedInstancesPage.length; i++) {
      //Change code below to process each resource in `managedInstancesPage`:
      console.log(JSON.stringify(managedInstancesPage[i], null, 2))
    }

    if (response.nextPageToken) {
      request.pageToken = response.nextPageToken
      compute.regionInstanceGroupManagers.listManagedInstances(request, handlePage)
    }
  }

  compute.regionInstanceGroupManagers.listManagedInstances(request, handlePage)
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
