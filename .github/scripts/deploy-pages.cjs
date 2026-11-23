// Use the upload result directly instead of immediately listing new artifacts by name.
module.exports = async ({ github, context, core }) => {
  const artifactId = Number(process.env.PAGES_ARTIFACT_ID);
  if (!Number.isSafeInteger(artifactId) || artifactId <= 0) {
    throw new Error('The Pages upload did not return a valid artifact ID.');
  }

  const parameters = { owner: context.repo.owner, repo: context.repo.repo };
  const pause = () => new Promise(resolve => setTimeout(resolve, 5000));
  for (let attempt = 0; ; attempt++) {
    try {
      const { data } = await github.rest.actions.getArtifact({
        ...parameters,
        artifact_id: artifactId
      });
      if (data.expired) throw new Error('The Pages artifact has expired.');
      break;
    } catch (error) {
      if (error.status !== 404 || attempt === 11) throw error;
      core.info('Waiting for the uploaded Pages artifact to become available.');
      await pause();
    }
  }

  const oidcToken = await core.getIDToken();
  const { data: deployment } = await github.request('POST /repos/{owner}/{repo}/pages/deployments', {
    ...parameters,
    artifact_id: artifactId,
    pages_build_version: context.sha,
    oidc_token: oidcToken
  });
  const deploymentId = deployment.id || deployment.status_url?.split('/').pop();
  if (!deploymentId) throw new Error('Pages did not return a deployment ID.');
  core.info('Created Pages deployment ' + deploymentId + ' for artifact ' + artifactId);

  const deadline = Date.now() + 600000;
  while (Date.now() < deadline) {
    await pause();
    let status;
    try {
      const { data } = await github.request('GET /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}', {
        ...parameters,
        pages_deployment_id: deploymentId
      });
      status = data.status;
    } catch (error) {
      if (error.status !== 404 && error.status < 500) throw error;
      core.warning('Pages status is temporarily unavailable. Checking again.');
      continue;
    }
    core.info('Pages deployment status: ' + status);
    if (status === 'succeed') {
      core.setOutput('page_url', deployment.page_url);
      return;
    }
    if (['deployment_failed', 'deployment_perms_error', 'deployment_content_failed',
      'deployment_cancelled', 'deployment_lost'].includes(status)) {
      throw new Error('Pages deployment ended with status ' + status);
    }
  }

  await github.request('POST /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel', {
    ...parameters,
    pages_deployment_id: deploymentId
  });
  throw new Error('Pages deployment exceeded the ten-minute deadline and was cancelled.');
};
